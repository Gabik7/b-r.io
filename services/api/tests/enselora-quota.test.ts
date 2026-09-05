import { expect, test } from "bun:test";
import { claimTryOnRequest, redisCommands, releaseUsage, reserveUsage, usageQuotaKey, reserveTryOn, releaseTryOn, remainingTryOns } from "../src/apps/enselora/api";
// Opt in with a disposable loopback Redis, never a production database.
const url = process.env.ENSELORA_QUOTA_TEST_URL;
if (url && !/^redis:\/\/127\.0\.0\.1:\d+$/.test(url)) throw new Error("Tests require isolated loopback Redis");
if (url) process.env.REDIS_URL = url;
const quotaTest = url ? test : test.skip;
quotaTest("concurrent reservations admit exactly quota without overdraw", async () => {
  const user = crypto.randomUUID();
  const results = await Promise.allSettled(Array.from({ length: 40 }, () => reserveUsage(user, "test", 5, "day", "limit")));
  const accepted = results.flatMap((r) => r.status === "fulfilled" ? [r.value] : []);
  expect(accepted).toHaveLength(5);
  expect(new Set(accepted.map((r) => r.remaining))).toEqual(new Set([0, 1, 2, 3, 4]));
  for (const r of results) if (r.status === "rejected") expect(r.reason.status).toBe(429);
  expect(Number((await redisCommands([["GET", usageQuotaKey(user, "test", "day")]]))[0].result)).toBe(5);
  await Promise.all(Array.from({ length: 20 }, () => releaseUsage(accepted[0].key)));
  expect((await reserveUsage(user, "test", 5, "day", "limit")).remaining).toBe(0);
  await expect(reserveUsage(user, "test", 5, "day", "limit")).rejects.toMatchObject({ status: 429 });
});
quotaTest("compensation cannot recreate expired counter or run twice", async () => {
  const user = crypto.randomUUID();
  const reservation = await reserveUsage(user, "test", 2, "day", "limit");
  const quota = usageQuotaKey(user, "test", "day");
  await redisCommands([["DEL", quota]]);
  await releaseUsage(reservation.key);
  await releaseUsage(reservation.key);
  expect((await redisCommands([["GET", quota]]))[0].result).toBeNull();
});
quotaTest("Try-On balance is shared across clients and refund is idempotent", async () => {
  const user = crypto.randomUUID();
  const results = await Promise.allSettled(Array.from({ length: 25 }, () => reserveTryOn(user)));
  const accepted = results.flatMap((r) => r.status === "fulfilled" ? [r.value] : []);
  expect(accepted).toHaveLength(20);
  expect(await remainingTryOns(user)).toBe(0);
  await Promise.all([releaseTryOn(accepted[0].key), releaseTryOn(accepted[0].key)]);
  expect(await remainingTryOns(user)).toBe(1);
});
quotaTest("same request can only be claimed once and lease covers fallback", async () => {
  const user = crypto.randomUUID(), request = crypto.randomUUID();
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => claimTryOnRequest(user, request)));
  const accepted = results.flatMap((r) => r.status === "fulfilled" ? [r.value] : []);
  expect(accepted).toHaveLength(1);
  expect(Number((await redisCommands([["TTL", accepted[0].key]]))[0].result)).toBeGreaterThan(600);
});

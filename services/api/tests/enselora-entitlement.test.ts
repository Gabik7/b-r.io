import { afterEach, expect, test } from "bun:test";
import { premiumAccess } from "../src/apps/enselora/entitlement";
import { hasPremiumEntitlement } from "../src/apps/enselora/api";
const now = Date.parse("2026-09-05T12:00:00Z");
const expired = { expires_date: "2026-09-04T12:00:00Z", product_identifier: "monthly" };
const active = { expires_date: "2026-10-05T12:00:00Z" };
const payload = (entitlements: object, subscriptions = {}) => ({ subscriber: { entitlements, subscriptions } });
test("expired canonical cannot mask active legacy access", () => {
  expect(premiumAccess(payload({ enselora_plus: expired, "ENSELORA+": active }), now).entitlement).toEqual(active);
});
test("billing grace is read from the associated subscription", () => {
  expect(premiumAccess(payload({ enselora_plus: expired }, { monthly: { grace_period_expires_date: active.expires_date } }), now).entitlement).toEqual(expired);
  expect(premiumAccess(payload({ enselora_plus: expired }, { other: { grace_period_expires_date: active.expires_date } }), now).entitlement).toBeUndefined();
});
test("missing and expired access differ from malformed upstream data", () => {
  expect(premiumAccess(payload({}), now).entitlement).toBeUndefined();
  expect(premiumAccess(payload({ enselora_plus: expired }), now).entitlement).toBeUndefined();
  expect(premiumAccess(payload({ enselora_plus: { expires_date: null } }), now).expiresAt).toBe(Infinity);
  for (const value of [null, {}, payload({ enselora_plus: {} }), payload({ enselora_plus: { expires_date: "invalid" } })]) expect(() => premiumAccess(value, now)).toThrow("invalid_entitlement_response");
});
const originalFetch = globalThis.fetch;
const originalKey = process.env.ENSELORA_REVENUECAT_SECRET_API_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.ENSELORA_REVENUECAT_SECRET_API_KEY;
  else process.env.ENSELORA_REVENUECAT_SECRET_API_KEY = originalKey;
});
test("new purchase unlocks without a cached free interval", async () => {
  process.env.ENSELORA_REVENUECAT_SECRET_API_KEY = "test-only";
  let calls = 0;
  globalThis.fetch = (async () => Response.json(payload(++calls === 1 ? {} : { enselora_plus: { expires_date: null } }))) as typeof fetch;
  const user = crypto.randomUUID();
  expect(await hasPremiumEntitlement(user)).toBe(false);
  expect(await hasPremiumEntitlement(user)).toBe(true);
  expect(calls).toBe(2);
});
test("audit invalidates positive cache and upstream outage stays visible", async () => {
  process.env.ENSELORA_REVENUECAT_SECRET_API_KEY = "test-only";
  let response = Response.json(payload({ enselora_plus: { expires_date: null } }));
  globalThis.fetch = (async () => response.clone()) as typeof fetch;
  const user = crypto.randomUUID();
  expect(await hasPremiumEntitlement(user)).toBe(true);
  response = Response.json(payload({}));
  expect(await hasPremiumEntitlement(user, true)).toBe(false);
  response = new Response(null, { status: 503 });
  await expect(hasPremiumEntitlement(user)).rejects.toMatchObject({ status: 502 });
});

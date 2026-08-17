import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { ApiError, authenticatedRequestIdentity, imageDataUrl, premiumEntitlementForUsage, rateLimitKey, requestIdentity, responseLanguage, tryOnQuotaKey, usageQuotaKey } from "../src/apps/enselora/api";
import { constantTimeSecretMatch } from "../src/apps/enselora/app-attest";
import { webhookAuthorized } from "../src/apps/enselora/commerce";
import { runtimeConfigStatus } from "../src/apps/enselora/config";

describe("ENSELORA API validation", () => {
  test("accepts a bounded JPEG base64 image", () => {
    expect(imageDataUrl("aGVsbG8=", "image/jpeg")).toBe("data:image/jpeg;base64,aGVsbG8=");
  });

  test("rejects unsupported image types", () => {
    expect(() => imageDataUrl("aGVsbG8=", "image/svg+xml")).toThrow(ApiError);
  });

  test("requires the installation identifier", () => {
    const request = new Request("https://example.com", {
      headers: { "x-enselora-client": "ios", "idempotency-key": crypto.randomUUID() },
    });
    expect(() => requestIdentity(request)).toThrow(ApiError);
  });

  test("requires a Supabase bearer token from the first production build", async () => {
    const userId = "12345678-1234-1234-1234-123456789abc";
    const requestId = crypto.randomUUID();
    const request = new Request("https://example.com", {
      headers: {
        "x-enselora-client": "ios",
        "x-enselora-user-id": userId,
        "idempotency-key": requestId,
      },
    });
    await expect(authenticatedRequestIdentity(request)).rejects.toBeInstanceOf(ApiError);
  });

  test("builds an isolated monthly quota key", () => {
    expect(tryOnQuotaKey("user-1", new Date("2026-08-15T12:00:00Z"))).toBe("enselora:tryon:2026-08:user-1");
  });

  test("builds deterministic rate-limit buckets", () => {
    expect(rateLimitKey("user-1", "analysis", 3600, Date.parse("2026-08-15T12:30:00Z")))
      .toBe(rateLimitKey("user-1", "analysis", 3600, Date.parse("2026-08-15T12:59:59Z")));
  });

  test("builds isolated daily and monthly usage quota keys", () => {
    const date = new Date("2026-08-15T12:00:00Z");
    expect(usageQuotaKey("user-1", "outfits", "day", date))
      .toBe("enselora:quota:outfits:day:2026-08-15:user-1");
    expect(usageQuotaKey("user-1", "analysis", "month", date))
      .toBe("enselora:quota:analysis:month:2026-08:user-1");
  });

  test("uses free limits when RevenueCat verification is unavailable", async () => {
    expect(await premiumEntitlementForUsage("12345678-1234-1234-1234-123456789abc")).toBe(false);
  });

  test("maps supported app locales to model response languages", () => {
    expect(responseLanguage("sk-SK")).toBe("Slovak");
    expect(responseLanguage("cs-CZ")).toBe("Czech");
    expect(responseLanguage("en-US")).toBe("English");
  });

  test("accepts only an exact, fresh RevenueCat HMAC over the raw body", () => {
    const rawBody = JSON.stringify({ event: { id: "event-1" } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    process.env.ENSELORA_REVENUECAT_WEBHOOK_AUTHORIZATION = "Bearer webhook-test";
    process.env.ENSELORA_REVENUECAT_WEBHOOK_SIGNING_SECRET = "signing-test";
    const signature = createHmac("sha256", "signing-test")
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");
    const request = new Request("https://example.com", {
      headers: {
        authorization: "Bearer webhook-test",
        "x-revenuecat-webhook-signature": `t=${timestamp},v1=${signature}`,
      },
    });

    expect(webhookAuthorized(request, rawBody)).toBe(true);
    expect(webhookAuthorized(request, `${rawBody} `)).toBe(false);
  });

  test("compares admin secrets without a partial match", () => {
    expect(constantTimeSecretMatch("same-secret", "same-secret")).toBe(true);
    expect(constantTimeSecretMatch("same", "same-secret")).toBe(false);
  });

  test("reports missing production configuration without exposing values", () => {
    const previous = process.env.ENSELORA_ADMIN_API_KEY;
    delete process.env.ENSELORA_ADMIN_API_KEY;
    const status = runtimeConfigStatus();
    expect(status.missing).toContain("ENSELORA_ADMIN_API_KEY");
    expect(JSON.stringify(status)).not.toContain("signing-test");
    if (previous) process.env.ENSELORA_ADMIN_API_KEY = previous;
  });
});

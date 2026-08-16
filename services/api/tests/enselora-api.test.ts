import { describe, expect, test } from "bun:test";
import { ApiError, authenticatedRequestIdentity, imageDataUrl, premiumEntitlementForUsage, rateLimitKey, requestIdentity, responseLanguage, tryOnQuotaKey, usageQuotaKey } from "../src/apps/enselora/api";

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
});

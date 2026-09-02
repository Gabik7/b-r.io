import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { ApiError, authenticatedRequestIdentity, detectedImageMimeType, imageDataUrl, premiumEntitlementForUsage, rateLimitKey, requestClientIdentifier, requestIPAddress, requestIdentity, responseLanguage, revenueCatPremiumEntitlement, safeProviderURL, tryOnQuotaKey, usageQuotaKey } from "../src/apps/enselora/api";
import { constantTimeSecretMatch } from "../src/apps/enselora/app-attest";
import { revenueCatEventUserId, webhookAuthorized } from "../src/apps/enselora/commerce";
import { runtimeConfigStatus } from "../src/apps/enselora/config";
import { supabaseAdminHeaders } from "../src/apps/enselora/supabase-admin";
import { adminAllowedIPs } from "../src/apps/enselora/security";
import { sanitizedGarmentPairings } from "../src/apps/enselora/styling-signals";

describe("ENSELORA API validation", () => {
  test("keeps only bounded, distinct wardrobe pairings for stylist learning", () => {
    const allowed = new Set(["shirt", "trousers", "shoes"]);

    expect(sanitizedGarmentPairings([
      ["shirt", "trousers", "unknown"],
      ["shirt", "shirt"],
      "not-a-pair",
      ["shoes", "trousers"],
    ], allowed)).toEqual([
      ["shirt", "trousers"],
      ["shoes", "trousers"],
    ]);
  });

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

  test("uses the normalized proxy IP without exposing it in Redis identifiers", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-real-ip": "::ffff:203.0.113.9",
        "x-forwarded-for": "198.51.100.4, 10.0.0.1",
      },
    });
    expect(requestIPAddress(request)).toBe("203.0.113.9");
    expect(requestClientIdentifier(request)).toMatch(/^[a-f0-9]{32}$/);
    expect(requestClientIdentifier(request)).not.toContain("203.0.113.9");
  });

  test("rejects provider URLs outside the explicit HTTPS allowlist", () => {
    expect(safeProviderURL("https://replicate.delivery/output.png"))
      .toBe("https://replicate.delivery/output.png");
    expect(safeProviderURL("https://pbxt.replicate.delivery/output.png"))
      .toBe("https://pbxt.replicate.delivery/output.png");
    expect(() => safeProviderURL("http://replicate.delivery/output.png")).toThrow(ApiError);
    expect(() => safeProviderURL("https://127.0.0.1/output.png")).toThrow(ApiError);
    expect(() => safeProviderURL("https://replicate.delivery.example.com/output.png")).toThrow(ApiError);
  });

  test("accepts only real JPEG, PNG and WebP provider payloads", () => {
    expect(detectedImageMimeType(new Uint8Array([0xff, 0xd8, 0xff, 0x00]))).toBe("image/jpeg");
    expect(detectedImageMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectedImageMimeType(new TextEncoder().encode("RIFF0000WEBP"))).toBe("image/webp");
    expect(detectedImageMimeType(new TextEncoder().encode("<svg></svg>"))).toBeUndefined();
  });

  test("normalizes and deduplicates exact admin IP allowlists", () => {
    expect(adminAllowedIPs("203.0.113.9, ::ffff:203.0.113.9, 2001:db8::1, invalid"))
      .toEqual(["203.0.113.9", "2001:db8::1"]);
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

  test("accepts canonical and legacy ENSELORA+ entitlement identifiers", () => {
    const canonical = { subscriber: { entitlements: { enselora_plus: { expires_date: null } } } };
    const legacy = { subscriber: { entitlements: { "ENSELORA+": { expires_date: null } } } };

    expect(revenueCatPremiumEntitlement(canonical)).toEqual({ expires_date: null });
    expect(revenueCatPremiumEntitlement(legacy)).toEqual({ expires_date: null });
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

  test("does not attach RevenueCat dashboard test events to a synthetic auth user", () => {
    expect(revenueCatEventUserId({
      id: "test-event",
      type: "TEST",
      app_user_id: "e31ca306-9680-4560-979a-f2009d78b97b",
    })).toBeUndefined();
  });

  test("uses new Supabase secret keys only as API keys", () => {
    expect(supabaseAdminHeaders("sb_secret_example")).toEqual({
      apikey: "sb_secret_example",
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(supabaseAdminHeaders("legacy-service-role-jwt").Authorization)
      .toBe("Bearer legacy-service-role-jwt");
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

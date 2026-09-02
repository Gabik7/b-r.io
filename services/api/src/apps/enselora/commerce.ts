import { createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { ApiError, revenueCatPremiumEntitlement } from "./api";
import { supabaseAdmin } from "./supabase-admin";

type RevenueCatEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  aliases?: string[];
  product_id?: string;
  environment?: string;
  event_timestamp_ms?: number;
};

function uuid(value: unknown): string | undefined {
  const candidate = typeof value === "string" ? value.toLowerCase() : "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(candidate)
    ? candidate
    : undefined;
}

export function revenueCatEventUserId(event: RevenueCatEvent): string | undefined {
  // RevenueCat's dashboard TEST event contains a synthetic UUID that is not a
  // Supabase Auth user. Persist the event, but do not attach it to the auth FK
  // or run entitlement/credit mutations for that synthetic identity.
  if (event.type === "TEST") return undefined;
  return uuid(event.app_user_id) || event.aliases?.map(uuid).find(Boolean);
}

export function webhookAuthorized(request: Request, rawBody: string): boolean {
  const expectedAuthorization = process.env.ENSELORA_REVENUECAT_WEBHOOK_AUTHORIZATION || "";
  if (!expectedAuthorization || request.headers.get("authorization") !== expectedAuthorization) return false;
  const secret = process.env.ENSELORA_REVENUECAT_WEBHOOK_SIGNING_SECRET || "";
  if (!secret) return false;
  const header = request.headers.get("x-revenuecat-webhook-signature") || "";
  const parts = Object.fromEntries(header.split(",").map((part) => {
    const index = part.indexOf("=");
    return index > 0 ? [part.slice(0, index), part.slice(index + 1)] : ["", ""];
  }));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!/^\d{10}$/.test(timestamp || "") || !/^[0-9a-f]{64}$/i.test(signature || "")) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const computed = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const actualBytes = Buffer.from(signature, "hex");
  const expectedBytes = Buffer.from(computed, "hex");
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

async function revenueCatPremiumStatus(userId: string): Promise<boolean> {
  const key = process.env.ENSELORA_REVENUECAT_SECRET_API_KEY || "";
  if (!key) throw new ApiError(503, "RevenueCat server key ešte nie je nastavený.");
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new ApiError(502, "RevenueCat audit sa nepodarilo dokončiť.");
  const payload = await response.json() as any;
  const entitlement = revenueCatPremiumEntitlement(payload);
  const expiration = entitlement?.expires_date ? Date.parse(entitlement.expires_date) : Number.POSITIVE_INFINITY;
  return Boolean(entitlement) && expiration > Date.now();
}

function creditProducts(): Record<string, number> {
  try {
    const parsed = JSON.parse(process.env.ENSELORA_TRYON_CREDIT_PRODUCTS_JSON || "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).flatMap(([key, value]) => {
      const count = Math.round(Number(value));
      return key && count > 0 && count <= 1000 ? [[key, count]] : [];
    }));
  } catch {
    throw new ApiError(503, "Mapa Try-On kreditov nie je platná.");
  }
}

export async function processRevenueCatWebhook(request: Request, rawBody: string): Promise<{ duplicate: boolean }> {
  if (!webhookAuthorized(request, rawBody)) throw new ApiError(401, "RevenueCat webhook sa nepodarilo overiť.");
  let payload: { event?: RevenueCatEvent };
  try { payload = JSON.parse(rawBody) as { event?: RevenueCatEvent }; } catch { throw new ApiError(400, "Webhook nemá platný JSON formát."); }
  const event = payload.event;
  if (!event?.id || !event.type || !event.app_user_id) throw new ApiError(400, "Webhook neobsahuje povinné polia.");
  const userId = revenueCatEventUserId(event);
  const inserted = await supabaseAdmin<Array<{ event_id: string }>>("revenuecat_webhook_events?on_conflict=event_id", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=representation",
    body: {
      event_id: event.id,
      event_type: event.type,
      user_id: userId || null,
      app_user_id: event.app_user_id,
      product_id: event.product_id || null,
      environment: event.environment || null,
      event_at: event.event_timestamp_ms ? new Date(event.event_timestamp_ms).toISOString() : null,
      payload,
    },
  });
  if (!inserted.length) {
    const existing = await supabaseAdmin<Array<{ processed_at: string | null }>>(
      `revenuecat_webhook_events?event_id=eq.${encodeURIComponent(event.id)}&select=processed_at&limit=1`,
    );
    if (existing[0]?.processed_at) return { duplicate: true };
  }

  try {
    if (userId) {
      const active = await revenueCatPremiumStatus(userId);
      await supabaseAdmin("sync_entitlements?on_conflict=user_id", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=minimal",
        body: { user_id: userId, is_active: active, checked_at: new Date().toISOString() },
      });
      const credits = event.product_id ? creditProducts()[event.product_id] : undefined;
      const creditEvents = new Set(["INITIAL_PURCHASE", "NON_RENEWING_PURCHASE"]);
      if (credits && creditEvents.has(event.type)) {
        await supabaseAdmin("rpc/grant_tryon_credits", {
          method: "POST",
          body: {
            p_user_id: userId,
            p_amount: credits,
            p_reason: "revenuecat_purchase",
            p_source_reference: `revenuecat:${event.id}`,
            p_metadata: { product_id: event.product_id, environment: event.environment },
          },
        });
      }
    }
    await supabaseAdmin(`revenuecat_webhook_events?event_id=eq.${encodeURIComponent(event.id)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { processed_at: new Date().toISOString(), processing_error: null },
    });
  } catch (error) {
    await supabaseAdmin(`revenuecat_webhook_events?event_id=eq.${encodeURIComponent(event.id)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { processing_error: (error instanceof Error ? error.message : "unknown").slice(0, 500) },
    });
    throw error;
  }
  return { duplicate: false };
}

export async function purchasedTryOnCreditBalance(userId: string): Promise<number> {
  return Math.max(0, await supabaseAdmin<number>("rpc/tryon_credit_balance_for", {
    method: "POST",
    body: { p_user_id: userId },
  }));
}

export async function consumePurchasedTryOnCredit(userId: string, requestId: string): Promise<boolean> {
  return await supabaseAdmin<boolean>("rpc/consume_tryon_credit", {
    method: "POST",
    body: { p_user_id: userId, p_source_reference: `tryon:${requestId}` },
  });
}

export async function refundPurchasedTryOnCredit(userId: string, requestId: string): Promise<void> {
  await supabaseAdmin("rpc/grant_tryon_credits", {
    method: "POST",
    body: {
      p_user_id: userId,
      p_amount: 1,
      p_reason: "provider_failure_refund",
      p_source_reference: `tryon-refund:${requestId}`,
      p_metadata: {},
    },
  });
}

export async function auditRevenueCatEntitlement(userId: string): Promise<{ active: boolean }> {
  if (!uuid(userId)) throw new ApiError(400, "User ID nie je platné UUID.");
  const active = await revenueCatPremiumStatus(userId);
  await supabaseAdmin("sync_entitlements?on_conflict=user_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { user_id: userId, is_active: active, checked_at: new Date().toISOString() },
  });
  return { active };
}

import { createClient } from "redis";

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function handleApiError(error: unknown, requestId?: string): Response {
  if (error instanceof ApiError) return json({ message: error.message, requestId }, error.status);
  console.error("ENSELORA API error", { requestId, error: error instanceof Error ? error.message : "unknown" });
  return json({ message: "Služba je dočasne nedostupná. Skús to znova.", requestId }, 502);
}

export async function readJson<T>(request: Request): Promise<T> {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 30 * 1024 * 1024) throw new ApiError(413, "Požiadavka je príliš veľká.");
  const text = await request.text();
  if (text.length > 30 * 1024 * 1024) throw new ApiError(413, "Požiadavka je príliš veľká.");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(400, "Požiadavka nemá platný JSON formát.");
  }
}

export function requestIdentity(request: Request): { userId: string; requestId: string } {
  if (request.headers.get("x-enselora-client")?.trim().toLowerCase() !== "ios") {
    throw new ApiError(401, "Aplikáciu sa nepodarilo overiť.");
  }
  const userId = request.headers.get("x-enselora-user-id")?.trim() || "";
  const requestId = request.headers.get("idempotency-key")?.trim() || crypto.randomUUID();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new ApiError(401, "Aplikáciu sa nepodarilo overiť.");
  }
  if (!/^[A-Za-z0-9._-]{16,100}$/.test(requestId)) {
    throw new ApiError(400, "Neplatný identifikátor požiadavky.");
  }
  return { userId, requestId };
}

export async function authenticatedRequestIdentity(request: Request): Promise<{ userId: string; requestId: string }> {
  const fallback = requestIdentity(request);
  const authorization = request.headers.get("authorization")?.trim() || "";
  if (!authorization) throw new ApiError(401, "Prihlásenie vypršalo. Otvor účet a prihlás sa znova.");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new ApiError(401, "Aplikáciu sa nepodarilo overiť.");
  const supabaseURL = (process.env.ENSELORA_SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseKey = process.env.ENSELORA_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseURL || !supabaseKey) throw new ApiError(503, "Overenie účtu ešte nie je nakonfigurované.");
  const response = await fetch(`${supabaseURL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${match[1]}`,
      apikey: supabaseKey,
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new ApiError(401, "Prihlásenie vypršalo. Prihlás sa znova.");
  const user = await response.json() as { id?: string };
  if (!user.id || !/^[0-9a-f-]{36}$/i.test(user.id)) throw new ApiError(401, "Účet sa nepodarilo overiť.");
  return { userId: user.id, requestId: fallback.requestId };
}

export function imageDataUrl(base64: unknown, mimeType = "image/jpeg"): string {
  if (typeof base64 !== "string" || !/^[A-Za-z0-9+/=\r\n]+$/.test(base64)) {
    throw new ApiError(400, "Obrázok nemá platný formát.");
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    throw new ApiError(400, "Tento formát obrázka nie je podporovaný.");
  }
  const bytes = Math.floor(base64.replace(/\s/g, "").length * 0.75);
  if (!bytes || bytes > MAX_IMAGE_BYTES) throw new ApiError(413, "Obrázok je príliš veľký.");
  return `data:${mimeType};base64,${base64.replace(/\s/g, "")}`;
}

export function responseLanguage(locale: unknown): string {
  const normalized = typeof locale === "string" ? locale.trim().toLowerCase() : "";
  if (normalized.startsWith("cs") || normalized.startsWith("cz")) return "Czech";
  if (normalized.startsWith("en")) return "English";
  return "Slovak";
}

export async function geminiJSON<T>(prompt: string, image?: { base64: string; mimeType: string }): Promise<T> {
  const apiKey = process.env.ENSELORA_GEMINI_API_KEY;
  const model = process.env.ENSELORA_GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) throw new ApiError(503, "AI služba ešte nie je nakonfigurovaná.");
  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) throw new ApiError(response.status === 429 ? 429 : 502, "AI model momentálne neodpovedá.");
  const payload = await response.json() as any;
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new ApiError(502, "AI model vrátil neplatnú odpoveď.");
  try { return JSON.parse(text) as T; } catch { throw new ApiError(502, "AI model vrátil neplatnú odpoveď."); }
}

type Prediction = { status?: string; output?: string | string[]; error?: string; urls?: { get?: string } };

export async function replicateRun(model: string, input: Record<string, unknown>, official = false): Promise<string> {
  const token = process.env.ENSELORA_REPLICATE_API_TOKEN;
  if (!token) throw new ApiError(503, "Obrazová služba ešte nie je nakonfigurovaná.");
  const url = official
    ? `https://api.replicate.com/v1/models/${model}/predictions`
    : "https://api.replicate.com/v1/predictions";
  const body = official ? { input } : { version: model, input };
  let response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=55",
      "Cancel-After": "90s",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new ApiError(response.status === 429 ? 429 : 502, "Obrazový model momentálne neodpovedá.");
  let prediction = await response.json() as Prediction;
  for (let attempt = 0; !["succeeded", "failed", "canceled"].includes(prediction.status || "") && attempt < 20; attempt++) {
    if (!prediction.urls?.get) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    response = await fetch(prediction.urls.get, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) });
    prediction = await response.json() as Prediction;
  }
  if (prediction.status !== "succeeded") throw new ApiError(504, "Generovanie trvalo príliš dlho. Skús to znova.");
  const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!output || !/^https:\/\//.test(output)) throw new ApiError(502, "Obrazový model vrátil neplatný výsledok.");
  return output;
}

export async function remoteImageBase64(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new ApiError(502, "Výsledný obrázok sa nepodarilo načítať.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 12 * 1024 * 1024) throw new ApiError(502, "Výsledný obrázok má neplatnú veľkosť.");
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

type CachedEntitlement = { isPremium: boolean; expiresAt: number };
const entitlementCache = new Map<string, CachedEntitlement>();

export async function hasPremiumEntitlement(userId: string): Promise<boolean> {
  const cached = entitlementCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.isPremium;

  const key = process.env.ENSELORA_REVENUECAT_SECRET_API_KEY;
  if (!key) throw new ApiError(503, "Overenie ENSELORA+ ešte nie je nakonfigurované.");
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 404) {
    entitlementCache.set(userId, { isPremium: false, expiresAt: Date.now() + 60_000 });
    return false;
  }
  if (!response.ok) throw new ApiError(502, "ENSELORA+ sa nepodarilo overiť.");
  const payload = await response.json() as any;
  const entitlement = payload?.subscriber?.entitlements?.enselora_plus;
  const expires = entitlement?.expires_date ? new Date(entitlement.expires_date).getTime() : Number.POSITIVE_INFINITY;
  const isPremium = Boolean(entitlement) && expires > Date.now();
  if (isPremium) {
    entitlementCache.set(userId, {
      isPremium: true,
      expiresAt: Math.min(Date.now() + 5 * 60_000, expires),
    });
  } else {
    entitlementCache.set(userId, { isPremium: false, expiresAt: Date.now() + 60_000 });
  }
  return isPremium;
}

export async function premiumEntitlementForUsage(userId: string): Promise<boolean> {
  try {
    return await hasPremiumEntitlement(userId);
  } catch (error) {
    if (error instanceof ApiError && [502, 503, 504].includes(error.status)) return false;
    throw error;
  }
}

export async function requirePremium(
  userId: string,
  message = "Táto funkcia je dostupná s aktívnym ENSELORA+.",
): Promise<void> {
  if (!await hasPremiumEntitlement(userId)) throw new ApiError(403, message);
}

let redisClient: ReturnType<typeof createClient> | undefined;
let redisConnection: Promise<unknown> | undefined;

async function connectedRedis(): Promise<ReturnType<typeof createClient>> {
  const url = process.env.REDIS_URL;
  if (!url) throw new ApiError(503, "Serverová kvóta ešte nie je nakonfigurovaná.");
  if (!redisClient) {
    redisClient = createClient({ url, socket: { connectTimeout: 8_000 } });
    redisClient.on("error", (error: unknown) => {
      console.error("GFCodes Redis error", { message: error instanceof Error ? error.message : "unknown" });
    });
  }
  if (!redisClient.isOpen) {
    redisConnection ??= redisClient.connect().finally(() => { redisConnection = undefined; });
    await redisConnection;
  }
  return redisClient;
}

async function redisPipeline(commands: unknown[][]): Promise<Array<{ result: unknown }>> {
  try {
    const client = await connectedRedis();
    const transaction = client.multi();
    for (const command of commands) transaction.addCommand(command.map(String));
    const results = await transaction.exec();
    return results.map((result) => ({ result }));
  } catch (error) {
    console.error("GFCodes Redis command failed", { message: error instanceof Error ? error.message : "unknown" });
    throw new ApiError(503, "Kvótu sa nepodarilo overiť.");
  }
}

export async function redisIsReady(): Promise<boolean> {
  try {
    return await (await connectedRedis()).ping() === "PONG";
  } catch {
    return false;
  }
}

export async function reserveTryOn(userId: string): Promise<{ key: string; remaining: number }> {
  const key = tryOnQuotaKey(userId);
  const results = await redisPipeline([["INCR", key], ["EXPIRE", key, 2_764_800]]);
  const count = Number(results?.[0]?.result);
  if (!Number.isFinite(count)) throw new ApiError(503, "Kvótu sa nepodarilo overiť.");
  if (count > 20) {
    await redisPipeline([["DECR", key]]);
    throw new ApiError(429, "Mesačný limit 20 Try-On náhľadov bol využitý.");
  }
  return { key, remaining: 20 - count };
}

export function tryOnQuotaKey(userId: string, date = new Date()): string {
  return `enselora:tryon:${date.toISOString().slice(0, 7)}:${userId}`;
}

export async function releaseTryOn(key: string): Promise<void> {
  try { await redisPipeline([["DECR", key]]); } catch { /* preserve original provider error */ }
}

export type QuotaPeriod = "day" | "month";

export function usageQuotaKey(
  userId: string,
  scope: string,
  period: QuotaPeriod,
  date = new Date(),
): string {
  const stamp = period === "day"
    ? date.toISOString().slice(0, 10)
    : date.toISOString().slice(0, 7);
  return `enselora:quota:${scope}:${period}:${stamp}:${userId}`;
}

export async function reserveUsage(
  userId: string,
  scope: string,
  limit: number,
  period: QuotaPeriod,
  message: string,
): Promise<{ key: string; remaining: number }> {
  const key = usageQuotaKey(userId, scope, period);
  const ttl = period === "day" ? 172_800 : 2_764_800;
  const results = await redisPipeline([["INCR", key], ["EXPIRE", key, ttl]]);
  const count = Number(results?.[0]?.result);
  if (!Number.isFinite(count)) throw new ApiError(503, "Kvótu sa nepodarilo overiť.");
  if (count > limit) {
    await redisPipeline([["DECR", key]]);
    throw new ApiError(429, message);
  }
  return { key, remaining: limit - count };
}

export async function releaseUsage(key: string): Promise<void> {
  try { await redisPipeline([["DECR", key]]); } catch { /* preserve original provider error */ }
}

export async function claimTryOnRequest(
  userId: string,
  requestId: string,
): Promise<{ key: string; resultURL?: string }> {
  return claimRemoteImageRequest(userId, requestId, "try-on");
}

export async function claimRemoteImageRequest(
  userId: string,
  requestId: string,
  scope: string,
): Promise<{ key: string; resultURL?: string }> {
  const key = `enselora:idempotency:${scope}:${userId}:${requestId}`;
  const existing = await redisPipeline([["GET", key]]);
  const value = existing?.[0]?.result;
  if (typeof value === "string" && value.startsWith("done:")) {
    return { key, resultURL: value.slice(5) };
  }
  if (value === "active") {
    throw new ApiError(409, "Try-On sa ešte spracúva. Chvíľu počkaj a skús zobraziť výsledok znova.");
  }
  const result = await redisPipeline([["SET", key, "active", "EX", 300, "NX"]]);
  if (result?.[0]?.result !== "OK") {
    throw new ApiError(409, "Try-On sa ešte spracúva. Chvíľu počkaj a skús zobraziť výsledok znova.");
  }
  return { key };
}

export async function completeTryOnRequest(key: string, resultURL: string): Promise<void> {
  return completeRemoteImageRequest(key, resultURL);
}

export async function completeRemoteImageRequest(key: string, resultURL: string): Promise<void> {
  if (!/^https:\/\//.test(resultURL)) throw new ApiError(502, "Výsledný obrázok má neplatnú adresu.");
  await redisPipeline([["SET", key, `done:${resultURL}`, "EX", 900]]);
}

export async function releaseTryOnRequest(key: string): Promise<void> {
  return releaseRemoteImageRequest(key);
}

export async function releaseRemoteImageRequest(key: string): Promise<void> {
  try { await redisPipeline([["DEL", key]]); } catch { /* preserve original provider error */ }
}

export async function claimJSONRequest(
  userId: string,
  requestId: string,
  scope: string,
): Promise<{ key: string; cached?: unknown }> {
  const key = `enselora:idempotency:${scope}:${userId}:${requestId}`;
  const existing = await redisPipeline([["GET", key]]);
  const value = existing?.[0]?.result;
  if (typeof value === "string" && value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value) as { data?: unknown };
      if ("data" in parsed) return { key, cached: parsed.data };
    } catch { /* an invalid cache value is treated as unavailable */ }
  }
  if (value === "active") throw new ApiError(409, "Požiadavka sa ešte spracúva. Skús to znova o chvíľu.");
  const claimed = await redisPipeline([["SET", key, "active", "EX", 180, "NX"]]);
  if (claimed?.[0]?.result !== "OK") {
    throw new ApiError(409, "Požiadavka sa ešte spracúva. Skús to znova o chvíľu.");
  }
  return { key };
}

export async function completeJSONRequest(key: string, data: unknown): Promise<void> {
  const value = JSON.stringify({ data });
  if (value.length > 128_000) throw new ApiError(502, "Výsledok je príliš veľký na bezpečné opakovanie požiadavky.");
  await redisPipeline([["SET", key, value, "EX", 600]]);
}

export async function releaseJSONRequest(key: string): Promise<void> {
  try { await redisPipeline([["DEL", key]]); } catch { /* preserve original provider error */ }
}

export function rateLimitKey(userId: string, scope: string, windowSeconds: number, now = Date.now()): string {
  const bucket = Math.floor(now / (windowSeconds * 1000));
  return `enselora:rate:${scope}:${bucket}:${userId}`;
}

export async function enforceRateLimit(
  userId: string,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const key = rateLimitKey(userId, scope, windowSeconds);
  const results = await redisPipeline([["INCR", key], ["EXPIRE", key, windowSeconds + 60]]);
  const count = Number(results?.[0]?.result);
  if (!Number.isFinite(count)) throw new ApiError(503, "Limit sa nepodarilo overiť.");
  if (count > limit) throw new ApiError(429, "Príliš veľa požiadaviek. Skús to neskôr.");
}

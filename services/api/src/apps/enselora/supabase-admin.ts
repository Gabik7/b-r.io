import { ApiError } from "./api";

function configuration(): { url: string; secret: string } {
  const url = (process.env.ENSELORA_SUPABASE_URL || "").replace(/\/$/, "");
  const secret = process.env.ENSELORA_SUPABASE_SECRET_KEY || "";
  if (!url || !secret) throw new ApiError(503, "Serverové úložisko ešte nie je nakonfigurované.");
  return { url, secret };
}

export function supabaseAdminHeaders(secret: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: secret,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // New sb_secret_* keys authenticate through the apikey header. Legacy
  // service_role keys are JWTs and must also be sent as a Bearer token.
  if (!secret.startsWith("sb_secret_")) headers.Authorization = `Bearer ${secret}`;
  return headers;
}

export async function supabaseAdmin<T>(
  path: string,
  options: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const { url, secret } = configuration();
  const response = await fetch(`${url}/rest/v1/${path}`,
    {
      method: options.method || "GET",
      headers: {
        ...supabaseAdminHeaders(secret),
        ...(options.prefer ? { Prefer: options.prefer } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) {
    const message = (await response.text()).slice(0, 500);
    console.error("ENSELORA Supabase admin error", { path, status: response.status, message });
    throw new ApiError(503, "Serverové údaje sa nepodarilo bezpečne uložiť.");
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function bestEffortSupabaseAdmin<T>(
  path: string,
  options: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T | undefined> {
  try {
    return await supabaseAdmin<T>(path, options);
  } catch (error) {
    console.error("ENSELORA non-blocking audit write failed", {
      path,
      message: error instanceof Error ? error.message : "unknown",
    });
    return undefined;
  }
}

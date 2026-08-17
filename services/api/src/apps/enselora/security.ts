import { isIP } from "node:net";
import { ApiError, enforceRateLimit, requestClientIdentifier, requestIPAddress } from "./api";
import { constantTimeSecretMatch } from "./app-attest";

function positiveIntegerEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] || fallback);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function adminAllowedIPs(value = process.env.ENSELORA_ADMIN_ALLOWED_IPS || ""): string[] {
  return Array.from(new Set(value
    .split(",")
    .map((item) => item.trim().replace(/^::ffff:/i, ""))
    .filter((item) => isIP(item) !== 0)));
}

export async function authorizeAdminRequest(request: Request): Promise<void> {
  const client = requestClientIdentifier(request);
  const limit = positiveIntegerEnv("ENSELORA_ADMIN_RATE_LIMIT_PER_MINUTE", 20);
  await enforceRateLimit(client, "admin-ip", limit, 60);

  const allowed = adminAllowedIPs();
  const address = requestIPAddress(request);
  if (allowed.length > 0 && (!address || !allowed.includes(address))) {
    throw new ApiError(403, "Admin prístup z tejto siete nie je povolený.");
  }

  const expected = process.env.ENSELORA_ADMIN_API_KEY || "";
  const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!expected || !constantTimeSecretMatch(actual, expected)) {
    throw new ApiError(401, "Admin prístup bol zamietnutý.");
  }
  await enforceRateLimit("global", "admin-authorized-global", limit * 3, 60);
}

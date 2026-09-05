// RevenueCat v1: grace belongs to the subscription associated with an entitlement.
function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}
function timestamp(value: unknown): number {
  const time = typeof value === "string" ? Date.parse(value) : NaN;
  if (!Number.isFinite(time)) throw new Error("invalid_entitlement_response");
  return time;
}
export function premiumAccess(payload: unknown, now = Date.now()): {
  entitlement?: Record<string, unknown>; expiresAt: number;
} {
  const subscriber = record(record(payload)?.subscriber);
  const entitlements = record(subscriber?.entitlements);
  if (!entitlements) throw new Error("invalid_entitlement_response");
  let result: { entitlement?: Record<string, unknown>; expiresAt: number } = { expiresAt: 0 };
  for (const id of ["enselora_plus", "ENSELORA+"]) {
    if (!(id in entitlements)) continue;
    const entitlement = record(entitlements[id]);
    if (!entitlement) throw new Error("invalid_entitlement_response");
    const subscription = record(record(subscriber?.subscriptions)?.[String(entitlement.product_identifier)]);
    const graceDate = subscription?.grace_period_expires_date ?? entitlement.grace_period_expires_date;
    const expiry = entitlement.expires_date === null ? Infinity : timestamp(entitlement.expires_date);
    const grace = graceDate == null ? 0 : timestamp(graceDate);
    const expiresAt = Math.max(expiry, grace);
    if (expiresAt > now && expiresAt > result.expiresAt) result = { entitlement, expiresAt };
  }
  return result;
}

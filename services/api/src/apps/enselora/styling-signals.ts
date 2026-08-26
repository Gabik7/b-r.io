export function sanitizedGarmentPairings(
  value: unknown,
  allowedGarmentIDs: Set<string>,
  limit = 12,
): string[][] {
  if (!Array.isArray(value)) return [];

  const pairings: string[][] = [];
  for (const candidate of value) {
    if (!Array.isArray(candidate)) continue;
    const pairing = Array.from(new Set(
      candidate.filter(
        (id): id is string => typeof id === "string" && allowedGarmentIDs.has(id),
      ),
    )).slice(0, 2);
    if (pairing.length !== 2) continue;
    pairings.push(pairing);
    if (pairings.length === limit) break;
  }
  return pairings;
}

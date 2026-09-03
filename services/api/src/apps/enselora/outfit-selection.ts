export type ModelOutfit = {
  title?: unknown;
  explanation?: unknown;
  itemIDs?: unknown;
};

export type ResolvedOutfit = {
  title: string;
  explanation: string;
  itemIDs: string[];
};

export function modelWardrobe<T extends { id: string }>(wardrobe: T[]): {
  items: Array<Omit<T, "id"> & { selectionID: string }>;
  garmentIDBySelectionID: Map<string, string>;
  selectionIDByGarmentID: Map<string, string>;
} {
  const garmentIDBySelectionID = new Map<string, string>();
  const selectionIDByGarmentID = new Map<string, string>();
  const items = wardrobe.map(({ id, ...item }, index) => {
    const selectionID = `g${index + 1}`;
    garmentIDBySelectionID.set(selectionID, id);
    selectionIDByGarmentID.set(id, selectionID);
    return { ...item, selectionID } as Omit<T, "id"> & { selectionID: string };
  });

  return { items, garmentIDBySelectionID, selectionIDByGarmentID };
}

export function modelGarmentIDs(ids: string[], selectionIDByGarmentID: Map<string, string>): string[] {
  return ids.flatMap((id) => {
    const selectionID = selectionIDByGarmentID.get(id);
    return selectionID ? [selectionID] : [];
  });
}

export function modelGarmentPairings(pairings: string[][], selectionIDByGarmentID: Map<string, string>): string[][] {
  return pairings.flatMap((pairing) => {
    const mapped = modelGarmentIDs(pairing, selectionIDByGarmentID);
    return mapped.length >= 2 ? [mapped] : [];
  });
}

function selectionID(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return `g${value}`;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return /^g\d+$/.test(normalized) ? normalized : undefined;
}

export function resolveModelOutfits(
  outfits: unknown,
  garmentIDBySelectionID: Map<string, string>,
  requestedCount: number,
): ResolvedOutfit[] {
  if (!Array.isArray(outfits)) return [];

  const seenCombinations = new Set<string>();
  const resolved: ResolvedOutfit[] = [];
  for (const value of outfits.slice(0, 12)) {
    if (!value || typeof value !== "object") continue;
    const outfit = value as ModelOutfit;
    const rawIDs = Array.isArray(outfit.itemIDs) ? outfit.itemIDs : [];
    const itemIDs = Array.from(new Set(rawIDs.flatMap((rawID) => {
      const key = selectionID(rawID);
      const garmentID = key ? garmentIDBySelectionID.get(key) : undefined;
      return garmentID ? [garmentID] : [];
    }))).slice(0, 4);
    const combination = [...itemIDs].sort().join(":");
    if (itemIDs.length < 2 || seenCombinations.has(combination)) continue;
    seenCombinations.add(combination);
    resolved.push({
      title: String(outfit.title || "Outfit").slice(0, 80),
      explanation: String(outfit.explanation || "").slice(0, 320),
      itemIDs,
    });
    if (resolved.length >= requestedCount) break;
  }

  return resolved;
}

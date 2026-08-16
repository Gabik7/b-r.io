import type { APIRoute } from "astro";
import { ApiError, authenticatedRequestIdentity, claimJSONRequest, completeJSONRequest, enforceRateLimit, geminiJSON, handleApiError, json, premiumEntitlementForUsage, readJson, releaseJSONRequest, releaseUsage, reserveUsage, responseLanguage } from "../../../../apps/enselora/api";

export const prerender = false;
type Garment = { id: string; name: string; category: string; colorName: string; season: string; wearCount: number; material?: string; pattern?: string };
type Body = {
  wardrobe?: Garment[];
  context?: { temperature?: number; weatherSymbol?: string; occasions?: string[] };
  signals?: { preferredGarmentIDs?: string[]; avoidedGarmentIDs?: string[]; rejectionReasons?: string[] };
  count?: number;
  locale?: string;
};
type OutfitResult = { title: string; explanation: string; itemIDs: string[] };
type Result = { outfits: OutfitResult[] };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  let reservationKey: string | undefined;
  let idempotencyKey: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    const claim = await claimJSONRequest(identity.userId, identity.requestId, "outfit-recommendation");
    if (claim.cached !== undefined) return json(claim.cached);
    idempotencyKey = claim.key;
    await enforceRateLimit(identity.userId, "outfit-recommendation", 60, 3600);
    const body = await readJson<Body>(request);
    const wardrobe = Array.isArray(body.wardrobe) ? body.wardrobe.slice(0, 100) : [];
    if (wardrobe.length < 3) throw new ApiError(400, "Na outfit potrebuješ aspoň tri kúsky.");
    const safe = wardrobe.map(({ id, name, category, colorName, season, wearCount, material, pattern }) => ({ id, name: String(name).slice(0, 80), category, colorName: String(colorName).slice(0, 40), season: String(season).slice(0, 40), wearCount: Number(wearCount) || 0, material: String(material || "").slice(0, 40), pattern: String(pattern || "").slice(0, 40) }));
    const ids = new Set(safe.map((item) => item.id));
    const signals = {
      preferredGarmentIDs: (body.signals?.preferredGarmentIDs || []).filter((id) => ids.has(id)).slice(0, 30),
      avoidedGarmentIDs: (body.signals?.avoidedGarmentIDs || []).filter((id) => ids.has(id)).slice(0, 30),
      rejectionReasons: (body.signals?.rejectionReasons || []).map((item) => String(item).slice(0, 80)).slice(0, 10),
    };
    const requestedCount = Math.min(3, Math.max(1, Math.round(Number(body.count) || 1)));
    const isPremium = await premiumEntitlementForUsage(identity.userId);
    if (!isPremium && requestedCount > 1) {
      throw new ApiError(403, "Tri varianty outfitu sú dostupné s ENSELORA+.");
    }
    const reservation = await reserveUsage(
      identity.userId,
      "outfit-generation",
      isPremium ? 5 : 1,
      "day",
      isPremium
        ? "Dnešných 5 AI návrhov bolo využitých. Ďalšie budú dostupné zajtra."
        : "Dnešný bezplatný AI návrh bol využitý. Ďalší je dostupný zajtra alebo s ENSELORA+.",
    );
    reservationKey = reservation.key;
    const result = await geminiJSON<Result>(`You are a practical personal stylist. Create ${requestedCount} meaningfully different outfits, each using 3-4 compatible real items only from this JSON wardrobe. Vary silhouette or layer while respecting context, category balance, weather, occasion and underused items. Prefer positively rated garments when they fit. Avoid negatively rated garments and rejection patterns when enough alternatives exist; never sacrifice weather or occasion suitability. Return only JSON with an outfits array; every item has title and explanation in ${responseLanguage(body.locale)} plus itemIDs. Wardrobe: ${JSON.stringify(safe)} Context: ${JSON.stringify(body.context || {})} Learned signals: ${JSON.stringify(signals)}`);
    const allowed = new Set(safe.map((item) => item.id));
    const seenCombinations = new Set<string>();
    result.outfits = (result.outfits || []).slice(0, requestedCount).map((outfit) => ({
      title: String(outfit.title || "Outfit").slice(0, 80),
      explanation: String(outfit.explanation || "").slice(0, 320),
      itemIDs: Array.from(new Set(outfit.itemIDs || [])).filter((id) => allowed.has(id)).slice(0, 4),
    })).filter((outfit) => {
      const key = [...outfit.itemIDs].sort().join(":");
      if (outfit.itemIDs.length < 2 || seenCombinations.has(key)) return false;
      seenCombinations.add(key);
      return true;
    });
    if (!result.outfits.length) throw new ApiError(502, "Outfit sa nepodarilo zostaviť.");

    await completeJSONRequest(idempotencyKey, result);
    idempotencyKey = undefined;
    return json(result);
  } catch (error) {
    if (reservationKey) await releaseUsage(reservationKey);
    if (idempotencyKey) await releaseJSONRequest(idempotencyKey);
    return handleApiError(error, requestId);
  }
};

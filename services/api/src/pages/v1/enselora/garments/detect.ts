import type { APIRoute } from "astro";
import { ApiError, authenticatedRequestIdentity, claimJSONRequest, completeJSONRequest, enforceRateLimit, geminiJSON, handleApiError, imageDataUrl, json, parseJson, premiumEntitlementForUsage, readRawBody, releaseJSONRequest, releaseUsage, reserveUsage, responseLanguage } from "../../../../apps/enselora/api";
import { verifyRequestAppAttest } from "../../../../apps/enselora/app-attest";

export const prerender = false;

type Body = { imageBase64?: string; mimeType?: string; locale?: string };
type Detection = {
  name?: string;
  category?: string;
  colorName?: string;
  paletteHex?: string;
  season?: string;
  material?: string;
  pattern?: string;
  box?: { x?: number; y?: number; width?: number; height?: number };
};
type Result = { garments?: Detection[] };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  let reservationKey: string | undefined;
  let idempotencyKey: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    const rawBody = await readRawBody(request);
    await verifyRequestAppAttest(request, identity.userId, rawBody);
    const claim = await claimJSONRequest(identity.userId, identity.requestId, "wardrobe-detection");
    if (claim.cached !== undefined) return json(claim.cached);
    idempotencyKey = claim.key;
    await enforceRateLimit(identity.userId, "wardrobe-detection", 20, 3600);
    const body = parseJson<Body>(rawBody);
    const mimeType = body.mimeType || "image/jpeg";
    imageDataUrl(body.imageBase64, mimeType);
    const isPremium = await premiumEntitlementForUsage(identity.userId);
    if (!isPremium) throw new ApiError(403, "Scan celej skrine je dostupný s ENSELORA+.");
    const reservation = await reserveUsage(
      identity.userId,
      "wardrobe-detection",
      60,
      "month",
      "Mesačný fair-use limit scanu skrine bol využitý.",
    );
    reservationKey = reservation.key;
    const result = await geminiJSON<Result>(
      `Find every clearly visible, distinct wearable garment or shoe in this image. Ignore hangers, furniture, bags and duplicate reflections. Return only JSON with a garments array of at most 12 items. Each item contains name in ${responseLanguage(body.locale)}, category (tops, bottoms, shoes, outerwear), colorName, paletteHex (#RRGGBB), season, optional material and pattern only when visually clear, and box coordinates x, y, width, height normalized from 0 to 1000 relative to the full image. Boxes must tightly enclose one item and stay within the image.`,
      { base64: body.imageBase64!, mimeType },
      { userId: identity.userId, requestId: identity.requestId, operation: "wardrobe-detection" },
    );
    const garments = (result.garments || []).slice(0, 12).flatMap((item) => {
      const box = item.box;
      const x = Math.round(Number(box?.x));
      const y = Math.round(Number(box?.y));
      const width = Math.round(Number(box?.width));
      const height = Math.round(Number(box?.height));
      if (![x, y, width, height].every(Number.isFinite) || width < 40 || height < 40 || x < 0 || y < 0 || x + width > 1000 || y + height > 1000) return [];
      if (!item.category || !["tops", "bottoms", "shoes", "outerwear"].includes(item.category)) return [];
      if (!/^#[0-9A-F]{6}$/i.test(item.paletteHex || "")) return [];
      return [{
        name: String(item.name || "Garment").slice(0, 80),
        category: item.category,
        colorName: String(item.colorName || "Neutral").slice(0, 40),
        paletteHex: item.paletteHex,
        season: String(item.season || "All season").slice(0, 60),
        material: item.material ? String(item.material).slice(0, 40) : undefined,
        pattern: item.pattern ? String(item.pattern).slice(0, 40) : undefined,
        box: { x, y, width, height },
      }];
    });
    if (!garments.length) throw new ApiError(422, "Na fotografii sa nenašli samostatné kúsky oblečenia.");
    const response = { garments };
    await completeJSONRequest(idempotencyKey, response);
    idempotencyKey = undefined;
    return json(response);
  } catch (error) {
    if (reservationKey) await releaseUsage(reservationKey);
    if (idempotencyKey) await releaseJSONRequest(idempotencyKey);
    return handleApiError(error, requestId);
  }
};

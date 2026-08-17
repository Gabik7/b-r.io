import type { APIRoute } from "astro";
import { ApiError, authenticatedRequestIdentity, claimJSONRequest, completeJSONRequest, enforceRateLimit, geminiJSON, handleApiError, imageDataUrl, json, parseJson, premiumEntitlementForUsage, readRawBody, releaseJSONRequest, releaseUsage, reserveUsage, responseLanguage } from "../../../../apps/enselora/api";
import { verifyRequestAppAttest } from "../../../../apps/enselora/app-attest";

export const prerender = false;

type Body = { imageBase64?: string; mimeType?: string; locale?: string };
type Result = { name: string; category: string; colorName: string; paletteHex: string; symbol?: string; season: string; material?: string; pattern?: string };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  let reservationKey: string | undefined;
  let idempotencyKey: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    const rawBody = await readRawBody(request);
    await verifyRequestAppAttest(request, identity.userId, rawBody);
    const claim = await claimJSONRequest(identity.userId, identity.requestId, "garment-analysis");
    if (claim.cached !== undefined) return json(claim.cached);
    idempotencyKey = claim.key;
    await enforceRateLimit(identity.userId, "garment-analysis", 30, 3600);
    const body = parseJson<Body>(rawBody);
    const mimeType = body.mimeType || "image/jpeg";
    imageDataUrl(body.imageBase64, mimeType);
    const isPremium = await premiumEntitlementForUsage(identity.userId);
    const reservation = await reserveUsage(
      identity.userId,
      "garment-analysis",
      isPremium ? 300 : 30,
      "month",
      isPremium
        ? "Mesačný fair-use limit AI analýzy bol využitý. Ďalšie kúsky môžeš pridať budúci mesiac."
        : "Bezplatný mesačný limit analýzy bol využitý. Pokračovať môžeš s ENSELORA+.",
    );
    reservationKey = reservation.key;
    const result = await geminiJSON<Result>(
      `Analyze the single garment. Return only JSON with name in ${responseLanguage(body.locale)}, category (tops, bottoms, shoes, outerwear), colorName, paletteHex (#RRGGBB), symbol (an SF Symbol), season in the requested language, and optional material and pattern in the requested language when visually clear. Never infer brand, price or an uncertain material.`,
      { base64: body.imageBase64!, mimeType },
      { userId: identity.userId, requestId: identity.requestId, operation: "garment-analysis" },
    );
    if (!["tops", "bottoms", "shoes", "outerwear"].includes(result.category) || !/^#[0-9A-F]{6}$/i.test(result.paletteHex || "")) {
      throw new ApiError(502, "Oblečenie sa nepodarilo spoľahlivo rozpoznať.");
    }
    await completeJSONRequest(idempotencyKey, result);
    idempotencyKey = undefined;
    return json(result);
  } catch (error) {
    if (reservationKey) await releaseUsage(reservationKey);
    if (idempotencyKey) await releaseJSONRequest(idempotencyKey);
    return handleApiError(error, requestId);
  }
};

import type { APIRoute } from "astro";
import { ApiError, authenticatedRequestIdentity, claimTryOnRequest, completeTryOnRequest, enforceAIRequestLimits, enforceRateLimit, geminiJSON, handleApiError, imageDataUrl, json, parseJson, readRawBody, releaseTryOn, releaseTryOnRequest, remoteImageBase64, replicateRun, requirePremium, reserveTryOn } from "../../../apps/enselora/api";
import { verifyRequestAppAttest } from "../../../apps/enselora/app-attest";
import { consumePurchasedTryOnCredit, refundPurchasedTryOnCredit } from "../../../apps/enselora/commerce";

export const prerender = false;
type Body = { personImageBase64?: string; garmentImagesBase64?: string[]; pose?: string; variantIndex?: number; quality?: string; locale?: string };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  let userId: string | undefined;
  let reservationKey: string | undefined;
  let purchasedCreditUsed = false;
  let idempotencyKey: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    userId = identity.userId;
    const rawBody = await readRawBody(request);
    await verifyRequestAppAttest(request, identity.userId, rawBody);
    await requirePremium(identity.userId, "Try-On je dostupný s aktívnym ENSELORA+.");
    const claim = await claimTryOnRequest(identity.userId, identity.requestId);
    if (claim.resultURL) {
      return json({ imageBase64: await remoteImageBase64(claim.resultURL), replayed: true });
    }
    idempotencyKey = claim.key;
    await enforceAIRequestLimits(request, "try-on");
    await enforceRateLimit(identity.userId, "try-on", 10, 3600);
    const body = parseJson<Body>(rawBody);
    const garments = Array.isArray(body.garmentImagesBase64) ? body.garmentImagesBase64.slice(0, 4) : [];
    if (!garments.length) throw new ApiError(400, "Vyber aspoň jeden kúsok oblečenia.");
    const person = imageDataUrl(body.personImageBase64, "image/jpeg");
    const garmentImages = garments.map((item) => imageDataUrl(item, item.startsWith("iVBOR") ? "image/png" : "image/jpeg"));
    const allowedPoses = new Set(["front-facing, natural standing pose", "natural three-quarter pose", "subtle walking pose, full body visible"]);
    const pose = allowedPoses.has(String(body.pose)) ? String(body.pose) : "front-facing, natural standing pose";
    const variantIndex = Math.min(3, Math.max(1, Math.round(Number(body.variantIndex) || 1)));
    let remaining = 0;
    try {
      const reservation = await reserveTryOn(identity.userId);
      reservationKey = reservation.key;
      remaining = reservation.remaining;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 429 || !await consumePurchasedTryOnCredit(identity.userId, identity.requestId)) {
        throw error;
      }
      purchasedCreditUsed = true;
    }
    const primaryModel = process.env.ENSELORA_REPLICATE_TRYON_MODEL_PRIMARY || "prunaai/p-image-try-on";
    const secondaryModel = process.env.ENSELORA_REPLICATE_TRYON_MODEL_SECONDARY || "";
    const compare = body.quality === "best"
      && process.env.ENSELORA_TRYON_COMPARE_ENABLED === "true"
      && secondaryModel.length > 0;
    const run = (model: string, label: string) => replicateRun(model, {
        person_image: person,
        garment_images: garmentImages,
        prompt: `${pose}; preserve the person's face, identity, body proportions and skin tone; preserve exact garment colors, visible material texture, hems and logos; layer garments in the supplied order without merging them; realistic shadows and contact points; visual variation ${variantIndex}; this is a styling preview, never alter body size`,
        output_format: "jpg",
        output_quality: 95,
        preserve_input_size: true,
        turbo: body.quality !== "best",
        no_op: false,
      }, true, {
        userId: identity.userId,
        requestId: `${identity.requestId}-${label}`,
        operation: `try-on-${label}`,
        estimatedCostMicros: Number(process.env.ENSELORA_REPLICATE_TRYON_COST_MICROS || 0),
      });

    let outputs: string[];
    if (compare) {
      const attempts = await Promise.allSettled([run(primaryModel, "primary"), run(secondaryModel, "secondary")]);
      outputs = attempts.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      if (!outputs.length) throw new ApiError(502, "Try-On modely momentálne neodpovedajú.");
    } else {
      try {
        outputs = [await run(primaryModel, "primary")];
      } catch (error) {
        if (!secondaryModel) throw error;
        outputs = [await run(secondaryModel, "fallback")];
      }
    }

    const candidates = await Promise.all(outputs.map(remoteImageBase64));
    let bestIndex = 0;
    if (candidates.length > 1) {
      const decision = await geminiJSON<{ bestIndex?: number }>(
        "The images are virtual try-on candidates in their supplied order. Choose the candidate that best preserves the same face and identity, garment colors, material texture, clean layering, natural anatomy and realistic contact shadows. Return only JSON with bestIndex using a zero-based integer. Do not judge attractiveness or body shape.",
        candidates.map((base64) => ({ base64, mimeType: "image/jpeg" })),
        { userId: identity.userId, requestId: `${identity.requestId}-judge`, operation: "try-on-quality-selection" },
      );
      const selected = Math.round(Number(decision.bestIndex));
      if (Number.isInteger(selected) && selected >= 0 && selected < candidates.length) bestIndex = selected;
    }
    const output = outputs[bestIndex];
    const imageBase64 = candidates[bestIndex];
    await completeTryOnRequest(idempotencyKey, output);
    idempotencyKey = undefined;
    return json({ imageBase64, remaining, usedPurchasedCredit: purchasedCreditUsed });
  } catch (error) {
    if (reservationKey) await releaseTryOn(reservationKey);
    if (purchasedCreditUsed && requestId && userId) {
      await refundPurchasedTryOnCredit(userId, requestId).catch(() => undefined);
    }
    if (idempotencyKey) await releaseTryOnRequest(idempotencyKey);
    return handleApiError(error, requestId);
  }
};

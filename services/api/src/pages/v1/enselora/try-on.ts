import type { APIRoute } from "astro";
import { ApiError, authenticatedRequestIdentity, claimTryOnRequest, completeTryOnRequest, enforceRateLimit, handleApiError, imageDataUrl, json, readJson, releaseTryOn, releaseTryOnRequest, remoteImageBase64, replicateRun, requirePremium, reserveTryOn } from "../../../apps/enselora/api";

export const prerender = false;
type Body = { personImageBase64?: string; garmentImagesBase64?: string[]; pose?: string; variantIndex?: number; locale?: string };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  let reservationKey: string | undefined;
  let idempotencyKey: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    await requirePremium(identity.userId, "Try-On je dostupný s aktívnym ENSELORA+.");
    await enforceRateLimit(identity.userId, "try-on", 10, 3600);
    const claim = await claimTryOnRequest(identity.userId, identity.requestId);
    if (claim.resultURL) {
      return json({ imageBase64: await remoteImageBase64(claim.resultURL), replayed: true });
    }
    idempotencyKey = claim.key;
    const body = await readJson<Body>(request);
    const garments = Array.isArray(body.garmentImagesBase64) ? body.garmentImagesBase64.slice(0, 4) : [];
    if (!garments.length) throw new ApiError(400, "Vyber aspoň jeden kúsok oblečenia.");
    const person = imageDataUrl(body.personImageBase64, "image/jpeg");
    const garmentImages = garments.map((item) => imageDataUrl(item, item.startsWith("iVBOR") ? "image/png" : "image/jpeg"));
    const allowedPoses = new Set(["front-facing, natural standing pose", "natural three-quarter pose", "subtle walking pose, full body visible"]);
    const pose = allowedPoses.has(String(body.pose)) ? String(body.pose) : "front-facing, natural standing pose";
    const variantIndex = Math.min(3, Math.max(1, Math.round(Number(body.variantIndex) || 1)));
    const reservation = await reserveTryOn(identity.userId);
    reservationKey = reservation.key;
    const output = await replicateRun("prunaai/p-image-try-on", {
      person_image: person,
      garment_images: garmentImages,
      prompt: `${pose}; preserve identity and garment details; visual variation ${variantIndex}`,
      output_format: "jpg",
      output_quality: 92,
      preserve_input_size: true,
      turbo: garments.length <= 4,
      no_op: false,
    }, true);
    const imageBase64 = await remoteImageBase64(output);
    await completeTryOnRequest(idempotencyKey, output);
    idempotencyKey = undefined;
    return json({ imageBase64, remaining: reservation.remaining });
  } catch (error) {
    if (reservationKey) await releaseTryOn(reservationKey);
    if (idempotencyKey) await releaseTryOnRequest(idempotencyKey);
    return handleApiError(error, requestId);
  }
};

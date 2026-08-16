import type { APIRoute } from "astro";
import { authenticatedRequestIdentity, claimRemoteImageRequest, completeRemoteImageRequest, enforceRateLimit, handleApiError, imageDataUrl, json, premiumEntitlementForUsage, readJson, releaseRemoteImageRequest, releaseUsage, remoteImageBase64, replicateRun, reserveUsage } from "../../../../apps/enselora/api";

export const prerender = false;
type Body = { imageBase64?: string; mimeType?: string };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  let reservationKey: string | undefined;
  let idempotencyKey: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    const claim = await claimRemoteImageRequest(identity.userId, identity.requestId, "background-removal");
    if (claim.resultURL) {
      return json({ imageBase64: await remoteImageBase64(claim.resultURL), replayed: true });
    }
    idempotencyKey = claim.key;
    await enforceRateLimit(identity.userId, "background-removal", 20, 86_400);
    const body = await readJson<Body>(request);
    const input = imageDataUrl(body.imageBase64, body.mimeType || "image/jpeg");
    const isPremium = await premiumEntitlementForUsage(identity.userId);
    const reservation = await reserveUsage(
      identity.userId,
      "background-removal",
      isPremium ? 200 : 40,
      "month",
      "Mesačný limit serverového čistenia fotografií bol využitý. Použi originál alebo to skús budúci mesiac.",
    );
    reservationKey = reservation.key;
    const model = process.env.ENSELORA_REPLICATE_BACKGROUND_MODEL || "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";
    const output = await replicateRun(model, { image: input, format: "png", threshold: 0, reverse: false, background_type: "rgba" });
    const imageBase64 = await remoteImageBase64(output);
    await completeRemoteImageRequest(idempotencyKey, output);
    idempotencyKey = undefined;
    return json({ imageBase64 });
  } catch (error) {
    if (reservationKey) await releaseUsage(reservationKey);
    if (idempotencyKey) await releaseRemoteImageRequest(idempotencyKey);
    return handleApiError(error, requestId);
  }
};

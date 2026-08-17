import type { APIRoute } from "astro";
import { ApiError, authenticatedRequestIdentity, enforceRateLimit, handleApiError, json, readJson } from "../../../../apps/enselora/api";
import { registerAppAttestKey } from "../../../../apps/enselora/app-attest";

export const prerender = false;

type Body = { challengeId?: string; keyId?: string; attestationObjectBase64?: string };

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    await enforceRateLimit(identity.userId, "app-attest-register", 10, 3600);
    const body = await readJson<Body>(request);
    if (!body.challengeId || !body.keyId || !body.attestationObjectBase64) {
      throw new ApiError(400, "App Attest registrácia nie je úplná.");
    }
    await registerAppAttestKey({
      userId: identity.userId,
      challengeId: body.challengeId,
      keyId: body.keyId,
      attestationObjectBase64: body.attestationObjectBase64,
    });
    return json({ registered: true });
  } catch (error) {
    return handleApiError(error, requestId);
  }
};

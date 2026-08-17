import type { APIRoute } from "astro";
import { authenticatedRequestIdentity, enforceRateLimit, handleApiError, json, readJson } from "../../../../apps/enselora/api";
import { appAttestMode, issueAppAttestChallenge } from "../../../../apps/enselora/app-attest";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    await enforceRateLimit(identity.userId, "app-attest-challenge", 120, 3600);
    const body = await readJson<{ purpose?: string }>(request);
    const purpose = body.purpose === "attestation" ? "attestation" : "assertion";
    return json({ ...(await issueAppAttestChallenge(identity.userId, purpose)), mode: appAttestMode() });
  } catch (error) {
    return handleApiError(error, requestId);
  }
};

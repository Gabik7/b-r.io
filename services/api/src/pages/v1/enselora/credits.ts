import type { APIRoute } from "astro";
import { authenticatedRequestIdentity, handleApiError, json } from "../../../apps/enselora/api";
import { purchasedTryOnCreditBalance } from "../../../apps/enselora/commerce";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  let requestId: string | undefined;
  try {
    const identity = await authenticatedRequestIdentity(request);
    requestId = identity.requestId;
    return json({ balance: await purchasedTryOnCreditBalance(identity.userId) });
  } catch (error) {
    return handleApiError(error, requestId);
  }
};

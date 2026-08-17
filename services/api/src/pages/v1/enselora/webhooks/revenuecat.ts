import type { APIRoute } from "astro";
import { handleApiError, json, readRawBody } from "../../../../apps/enselora/api";
import { processRevenueCatWebhook } from "../../../../apps/enselora/commerce";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await readRawBody(request);
    return json({ received: true, ...(await processRevenueCatWebhook(request, rawBody)) });
  } catch (error) {
    return handleApiError(error);
  }
};

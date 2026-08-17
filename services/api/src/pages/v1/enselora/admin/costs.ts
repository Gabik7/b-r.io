import type { APIRoute } from "astro";
import { handleApiError, json } from "../../../../apps/enselora/api";
import { authorizeAdminRequest } from "../../../../apps/enselora/security";
import { costSummary } from "../../../../apps/enselora/usage";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    await authorizeAdminRequest(request);
    const days = Number(new URL(request.url).searchParams.get("days") || 30);
    return json(await costSummary(days));
  } catch (error) {
    return handleApiError(error);
  }
};

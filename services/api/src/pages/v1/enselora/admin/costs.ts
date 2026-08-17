import type { APIRoute } from "astro";
import { ApiError, handleApiError, json } from "../../../../apps/enselora/api";
import { constantTimeSecretMatch } from "../../../../apps/enselora/app-attest";
import { costSummary } from "../../../../apps/enselora/usage";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const expected = process.env.ENSELORA_ADMIN_API_KEY || "";
    const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (!expected || !constantTimeSecretMatch(actual, expected)) throw new ApiError(401, "Admin prístup bol zamietnutý.");
    const days = Number(new URL(request.url).searchParams.get("days") || 30);
    return json(await costSummary(days));
  } catch (error) {
    return handleApiError(error);
  }
};

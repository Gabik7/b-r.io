import type { APIRoute } from "astro";
import { ApiError, handleApiError, json, readJson } from "../../../../../apps/enselora/api";
import { constantTimeSecretMatch } from "../../../../../apps/enselora/app-attest";
import { auditRevenueCatEntitlement } from "../../../../../apps/enselora/commerce";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const expected = process.env.ENSELORA_ADMIN_API_KEY || "";
    const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (!expected || !constantTimeSecretMatch(actual, expected)) throw new ApiError(401, "Admin prístup bol zamietnutý.");
    const body = await readJson<{ userId?: string }>(request);
    if (!body.userId) throw new ApiError(400, "Chýba userId.");
    return json(await auditRevenueCatEntitlement(body.userId));
  } catch (error) {
    return handleApiError(error);
  }
};

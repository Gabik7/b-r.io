import type { APIRoute } from "astro";
import { ApiError, handleApiError, json, readJson } from "../../../../../apps/enselora/api";
import { auditRevenueCatEntitlement } from "../../../../../apps/enselora/commerce";
import { authorizeAdminRequest } from "../../../../../apps/enselora/security";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    await authorizeAdminRequest(request);
    const body = await readJson<{ userId?: string }>(request);
    if (!body.userId) throw new ApiError(400, "Chýba userId.");
    return json(await auditRevenueCatEntitlement(body.userId));
  } catch (error) {
    return handleApiError(error);
  }
};

import type { APIRoute } from "astro";
import { proxySetlyvoRequest } from "../../../apps/setlyvo/proxy";

export const prerender = false;

const handler: APIRoute = async ({ request, params }) => {
  return proxySetlyvoRequest(request, params.path || "");
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

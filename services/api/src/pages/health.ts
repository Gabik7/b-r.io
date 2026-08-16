import type { APIRoute } from "astro";
import { json, redisIsReady } from "../apps/enselora/api";

export const prerender = false;
export const GET: APIRoute = async () => {
  const redis = await redisIsReady();
  return json({ ok: redis, service: "gfcodes-api", dependencies: { redis } }, redis ? 200 : 503);
};

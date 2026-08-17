import type { APIRoute } from "astro";
import { json, redisIsReady } from "../apps/enselora/api";
import { runtimeConfigStatus } from "../apps/enselora/config";

export const prerender = false;
export const GET: APIRoute = async () => {
  const redis = await redisIsReady();
  const configuration = runtimeConfigStatus();
  const ok = redis && configuration.ready;
  return json({
    ok,
    service: "gfcodes-api",
    dependencies: { redis },
    configuration: {
      ready: configuration.ready,
      missing: configuration.missing,
      invalid: configuration.invalid,
    },
  }, ok ? 200 : 503);
};

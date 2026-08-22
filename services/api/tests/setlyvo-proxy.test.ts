import { afterEach, describe, expect, test } from "bun:test";
import { buildSetlyvoUpstreamRequest, proxySetlyvoRequest, setlyvoUpstreamURL, SetlyvoProxyError } from "../src/apps/setlyvo/proxy";

const previousUpstream = process.env.SETLYVO_API_UPSTREAM_URL;

afterEach(() => {
  if (previousUpstream === undefined) delete process.env.SETLYVO_API_UPSTREAM_URL;
  else process.env.SETLYVO_API_UPSTREAM_URL = previousUpstream;
});

describe("Setlyvo API gateway", () => {
  test("maps the public Setlyvo path and query to the private Laravel API", () => {
    process.env.SETLYVO_API_UPSTREAM_URL = "http://setlyvo-api:8080/api/v1/";
    const url = setlyvoUpstreamURL(
      "equipment-types",
      new URL("https://api.gfcodes.com/v1/setlyvo/equipment-types?search=lat%20pull"),
    );
    expect(url.toString()).toBe("http://setlyvo-api:8080/api/v1/equipment-types?search=lat%20pull");
  });

  test("forwards only required request headers and preserves the body", async () => {
    process.env.SETLYVO_API_UPSTREAM_URL = "http://setlyvo-api:8080/api/v1/";
    const upstream = await buildSetlyvoUpstreamRequest(new Request(
      "https://api.gfcodes.com/v1/setlyvo/gyms",
      {
        method: "POST",
        headers: {
          authorization: "Bearer opaque-token",
          "content-type": "application/json",
          cookie: "must-not-forward=true",
          "x-real-ip": "::ffff:203.0.113.9",
          "x-forwarded-for": "198.51.100.5",
        },
        body: JSON.stringify({ name: "Downtown" }),
      },
    ), "gyms");

    expect(upstream.url).toBe("http://setlyvo-api:8080/api/v1/gyms");
    expect(upstream.headers.get("authorization")).toBe("Bearer opaque-token");
    expect(upstream.headers.get("cookie")).toBeNull();
    expect(upstream.headers.get("x-real-ip")).toBe("203.0.113.9");
    expect(upstream.headers.get("x-forwarded-for")).toBe("203.0.113.9");
    expect(upstream.headers.get("x-gfcodes-proxy")).toBe("setlyvo");
    expect(await upstream.json()).toEqual({ name: "Downtown" });
  });

  test("returns the Laravel status and safe response headers unchanged", async () => {
    process.env.SETLYVO_API_UPSTREAM_URL = "http://setlyvo-api:8080/api/v1/";
    const response = await proxySetlyvoRequest(
      new Request("https://api.gfcodes.com/v1/setlyvo/gyms", { headers: { authorization: "Bearer test" } }),
      "gyms",
      async () => Response.json({ gyms: [] }, { status: 200, headers: { "x-secret": "hidden" } }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-secret")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ gyms: [] });
  });

  test("preserves bodyless Laravel delete responses", async () => {
    process.env.SETLYVO_API_UPSTREAM_URL = "http://setlyvo-api:8080/api/v1/";
    const response = await proxySetlyvoRequest(
      new Request("https://api.gfcodes.com/v1/setlyvo/gyms/gym-1", { method: "DELETE" }),
      "gyms/gym-1",
      async () => new Response(null, { status: 204 }),
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  test("fails closed when the upstream is missing", () => {
    delete process.env.SETLYVO_API_UPSTREAM_URL;
    expect(() => setlyvoUpstreamURL("health", new URL("https://api.gfcodes.com/v1/setlyvo/health")))
      .toThrow(SetlyvoProxyError);
  });
});

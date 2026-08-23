import { isIP } from "node:net";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "x-request-id",
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "retry-after",
  "x-request-id",
] as const;

export class SetlyvoProxyError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function setlyvoUpstreamURL(path: string, publicRequestURL: URL): URL {
  const configured = process.env.SETLYVO_API_UPSTREAM_URL?.trim();
  if (!configured) {
    throw new SetlyvoProxyError(503, "serviceUnavailable", "Setlyvo API is not configured.");
  }

  let base: URL;
  try {
    base = new URL(configured.endsWith("/") ? configured : `${configured}/`);
  } catch {
    throw new SetlyvoProxyError(503, "serviceUnavailable", "Setlyvo API is not configured.");
  }
  if (!["http:", "https:"].includes(base.protocol)) {
    throw new SetlyvoProxyError(503, "serviceUnavailable", "Setlyvo API is not configured.");
  }

  const segments = path.split("/").filter(Boolean);
  if (!segments.length || segments.some((segment) => segment === "." || segment === "..")) {
    throw new SetlyvoProxyError(404, "resourceNotFound", "Endpoint not found.");
  }

  const upstream = new URL(segments.map(encodeURIComponent).join("/"), base);
  upstream.search = publicRequestURL.search;
  return upstream;
}

export async function buildSetlyvoUpstreamRequest(request: Request, path: string): Promise<Request> {
  const upstream = setlyvoUpstreamURL(path, new URL(request.url));
  const headers = new Headers();
  for (const key of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  const proxyAddress = (request.headers.get("x-real-ip") || "").trim().replace(/^::ffff:/i, "");
  if (isIP(proxyAddress) !== 0) {
    headers.set("x-real-ip", proxyAddress);
    headers.set("x-forwarded-for", proxyAddress);
  }
  headers.set("x-gfcodes-proxy", "setlyvo");

  const hasBody = !["GET", "HEAD"].includes(request.method.toUpperCase());
  const body = hasBody ? await request.arrayBuffer() : undefined;

  return new Request(upstream, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(120_000),
  });
}

export async function proxySetlyvoRequest(
  request: Request,
  path: string,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  try {
    const upstreamResponse = await fetcher(await buildSetlyvoUpstreamRequest(request, path));
    const headers = new Headers();
    for (const key of FORWARDED_RESPONSE_HEADERS) {
      const value = upstreamResponse.headers.get(key);
      if (value) headers.set(key, value);
    }
    headers.set("cache-control", "no-store");

    const bodyless = request.method.toUpperCase() === "HEAD" || [204, 205, 304].includes(upstreamResponse.status);
    return new Response(bodyless ? null : await upstreamResponse.arrayBuffer(), {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    if (error instanceof SetlyvoProxyError) {
      return proxyError(error.status, error.code, error.message);
    }
    return proxyError(502, "upstreamUnavailable", "Setlyvo API is temporarily unavailable.");
  }
}

function proxyError(status: number, code: string, message: string): Response {
  return Response.json({
    error: {
      code,
      message,
      requestId: crypto.randomUUID(),
    },
  }, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

import { NextRequest, NextResponse } from 'next/server'

const edgeEndpoint =
  'https://mkxlyxyvdrnystgrlkxm.supabase.co/functions/v1/remote-approval'
const tokenPattern = /^[A-Za-z0-9_-]{40,50}$/
const maximumBodyBytes = 1_600_000

class RequestTooLargeError extends Error {}

async function readBoundedJSON(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Missing request body')

  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maximumBodyBytes) {
      await reader.cancel()
      throw new RequestTooLargeError()
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

export const dynamic = 'force-dynamic'

function securedJSON(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  })
}

async function forward(upstream: Response) {
  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  })
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > maximumBodyBytes) {
    return securedJSON({ error: 'Podpis je príliš veľký.' }, 413)
  }

  const origin = request.headers.get('origin')
  const allowedOrigins = new Set([
    request.nextUrl.origin,
    'http://127.0.0.1:3100',
    'http://localhost:3100',
    'https://gfcodes.com',
    'https://www.gfcodes.com',
  ])
  if (origin && !allowedOrigins.has(origin)) {
    return securedJSON({ error: 'Požiadavka z tejto stránky nie je povolená.' }, 403)
  }

  let body: {
    operation?: 'read' | 'respond'
    token?: string
    action?: 'approved' | 'rejected'
    name?: string
    note?: string
    signature?: string | null
  }
  try {
    body = (await readBoundedJSON(request)) as typeof body
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return securedJSON({ error: 'Podpis je príliš veľký.' }, 413)
    }
    return securedJSON({ error: 'Neplatná požiadavka.' }, 400)
  }

  if (!tokenPattern.test(body.token ?? '')) {
    return securedJSON({ error: 'Neplatný odkaz.' }, 400)
  }
  if (!['read', 'respond'].includes(body.operation ?? '')) {
    return securedJSON({ error: 'Neplatná požiadavka.' }, 400)
  }

  try {
    const upstream = await fetch(edgeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    })
    return forward(upstream)
  } catch {
    return securedJSON(
      {
        error: 'Služba nie je dostupná.',
        detail: 'Skúste to o chvíľu znova.',
      },
      503,
    )
  }
}

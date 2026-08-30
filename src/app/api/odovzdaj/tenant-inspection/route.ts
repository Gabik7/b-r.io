import { NextRequest, NextResponse } from 'next/server'

const edgeEndpoint =
  'https://mkxlyxyvdrnystgrlkxm.supabase.co/functions/v1/tenant-inspection'
const tokenPattern = /^[A-Za-z0-9_-]{40,60}$/

export const dynamic = 'force-dynamic'

function tokenFrom(request: NextRequest) {
  return request.nextUrl.searchParams.get('token') ?? ''
}

function invalidToken() {
  return NextResponse.json(
    {
      error: 'Neplatný odkaz',
      detail: 'Požiadajte odosielateľa o nový kontrolný odkaz.',
    },
    { status: 400 },
  )
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

export async function GET(request: NextRequest) {
  const token = tokenFrom(request)
  if (!tokenPattern.test(token)) return invalidToken()

  try {
    const upstream = await fetch(
      `${edgeEndpoint}?token=${encodeURIComponent(token)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(15_000) },
    )
    return forward(upstream)
  } catch {
    return NextResponse.json(
      {
        error: 'Služba nie je dostupná',
        detail: 'Skúste to o chvíľu znova.',
      },
      { status: 503 },
    )
  }
}

export async function POST(request: NextRequest) {
  const token = tokenFrom(request)
  if (!tokenPattern.test(token)) return invalidToken()

  try {
    const form = await request.formData()
    const upstream = await fetch(
      `${edgeEndpoint}?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        body: form,
        cache: 'no-store',
        signal: AbortSignal.timeout(45_000),
      },
    )
    return forward(upstream)
  } catch {
    return NextResponse.json(
      {
        error: 'Kontrolu sa nepodarilo odoslať',
        detail: 'Skontrolujte pripojenie a skúste to znova.',
      },
      { status: 503 },
    )
  }
}

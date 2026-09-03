'use client'

import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react'

type ApprovalPayload = {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
  expected_signer_name?: string
  expires_at?: string
  protocol_code?: string
  error?: string
  detail?: string
}

const tokenPattern = /^[A-Za-z0-9_-]{40,50}$/
const tokenStorageKey = 'odovzdaj.remote-approval-token'

function StatusCard({ payload }: { payload: ApprovalPayload }) {
  const contentByStatus: Partial<Record<NonNullable<ApprovalPayload['status']>, [string, string]>> = {
    approved: ['Protokol bol schválený', 'Vaše rozhodnutie a podpis boli bezpečne zaznamenané.'],
    rejected: ['Protokol bol odmietnutý', 'Vaše rozhodnutie bolo bezpečne zaznamenané.'],
    cancelled: ['Odkaz bol zrušený', 'Požiadajte odosielateľa o nový odkaz, ak je potvrdenie stále potrebné.'],
    expired: ['Platnosť odkazu vypršala', 'Požiadajte odosielateľa o nový jednorazový odkaz.'],
  }
  const content = (payload.status ? contentByStatus[payload.status] : undefined) ??
    ['Žiadosť bola uzavretá', 'Rozhodnutie už nemožno cez tento odkaz zmeniť.']

  return <ResultCard title={content[0]} detail={content[1]} success={payload.status === 'approved'} />
}

function ResultCard({
  title,
  detail,
  success = false,
}: {
  title: string
  detail: string
  success?: boolean
}) {
  return (
    <main className="mx-auto min-h-[70vh] max-w-2xl px-4 pt-40 pb-24 sm:px-6 sm:pt-48">
      <div className="border-t border-ink/15 pt-8">
        <div
          className={`mb-8 flex size-12 items-center justify-center rounded-full text-xl font-medium ${
            success ? 'bg-[#dfe9df] text-[#31543d]' : 'bg-[#f1dfda] text-[#8b3d30]'
          }`}
          aria-hidden="true"
        >
          {success ? '✓' : '!'}
        </div>
        <p className="font-medium text-ink/55">Odovzdaj · potvrdenie protokolu</p>
        <h1 className="mt-5 text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.92] font-medium tracking-[-0.055em] text-balance">
          {title}
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/62">{detail}</p>
      </div>
    </main>
  )
}

export function ApprovalForm() {
  const [token, setToken] = useState('')
  const [payload, setPayload] = useState<ApprovalPayload | null>(null)
  const [loadError, setLoadError] = useState<ApprovalPayload | null>(null)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState<ApprovalPayload | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasInkRef = useRef(false)

  useEffect(() => {
    const fragmentParameters = new URLSearchParams(window.location.hash.slice(1))
    const fragment = fragmentParameters.get('token') ?? ''
    const stored = window.sessionStorage.getItem(tokenStorageKey) ?? ''
    const resolved = fragmentParameters.has('token') ? fragment : stored
    if (tokenPattern.test(fragment)) {
      window.sessionStorage.setItem(tokenStorageKey, fragment)
      window.history.replaceState(null, '', window.location.pathname)
    }
    const updateState = window.setTimeout(() => {
      if (!tokenPattern.test(resolved)) {
        setLoadError({
          error: 'Neplatný odkaz',
          detail: 'Požiadajte odosielateľa o nový potvrdzovací odkaz.',
        })
        return
      }
      setToken(resolved)
    }, 0)
    return () => window.clearTimeout(updateState)
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    fetch('/api/odovzdaj/remote-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'read', token }),
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const value = (await response.json()) as ApprovalPayload
        if (!response.ok) throw value
        if (value.status !== 'pending') window.sessionStorage.removeItem(tokenStorageKey)
        setPayload(value)
        setName(value.expected_signer_name ?? '')
      })
      .catch((error: ApprovalPayload | Error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        window.sessionStorage.removeItem(tokenStorageKey)
        setLoadError(
          'error' in error
            ? error
            : { error: 'Služba nie je dostupná', detail: 'Skúste to o chvíľu znova.' },
        )
      })
    return () => controller.abort()
  }, [token])

  function canvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const bounds = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - bounds.left) * canvas.width) / bounds.width,
      y: ((event.clientY - bounds.top) * canvas.height) / bounds.height,
    }
  }

  function beginSignature(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    canvas.setPointerCapture(event.pointerId)
    const point = canvasPoint(event)
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.lineWidth = 5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#181716'
    drawingRef.current = true
  }

  function drawSignature(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    const point = canvasPoint(event)
    context.lineTo(point.x, point.y)
    context.stroke()
    hasInkRef.current = true
  }

  function endSignature(event: PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId)
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    hasInkRef.current = false
    setSubmitError('')
  }

  function useTypedSignature() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const signerName = name.trim()
    if (!canvas || !context || !signerName) {
      setSubmitError('Najprv doplňte meno podpisujúcej osoby.')
      return
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#181716'
    context.font = 'italic 64px Georgia, serif'
    context.textBaseline = 'middle'
    context.fillText(signerName, 42, canvas.height / 2, canvas.width - 84)
    hasInkRef.current = true
    setSubmitError('')
  }

  async function respond(action: 'approved' | 'rejected') {
    if (submitting) return
    if (!name.trim() || !consent) {
      setSubmitError('Doplňte meno a potvrďte súhlas.')
      return
    }
    if (action === 'approved' && !hasInkRef.current) {
      setSubmitError('Pridajte svoj podpis.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/odovzdaj/remote-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'respond',
          token,
          action,
          name: name.trim(),
          note: note.trim(),
          signature: action === 'approved' ? canvasRef.current?.toDataURL('image/png') : null,
        }),
      })
      const value = (await response.json()) as ApprovalPayload
      if (!response.ok) throw value
      window.sessionStorage.removeItem(tokenStorageKey)
      setSubmitted({ status: action })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const value = error as ApprovalPayload
      setSubmitError(value.error ?? 'Rozhodnutie sa nepodarilo uložiť. Skúste to znova.')
    } finally {
      setSubmitting(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void respond('approved')
  }

  if (submitted) return <StatusCard payload={submitted} />
  if (loadError) {
    return (
      <ResultCard
        title={loadError.error ?? 'Odkaz nie je dostupný'}
        detail={loadError.detail ?? 'Požiadajte odosielateľa o nový odkaz.'}
      />
    )
  }
  if (!payload) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 pt-40 pb-24 sm:px-6 sm:pt-48">
        <p className="font-medium text-ink/55">Odovzdaj · potvrdenie protokolu</p>
        <div className="mt-7 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-terracotta" />
        </div>
        <p className="mt-5 text-ink/58">Bezpečne overujem odkaz…</p>
      </main>
    )
  }
  if (payload.status !== 'pending') return <StatusCard payload={payload} />

  const expiresAt = payload.expires_at
    ? new Intl.DateTimeFormat('sk-SK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(payload.expires_at))
    : null

  return (
    <main className="px-4 pt-36 pb-28 sm:px-6 sm:pt-44">
      <header className="mx-auto grid max-w-5xl gap-10 border-b border-ink/12 pb-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-20">
        <div>
          <p className="font-medium text-ink/55">Odovzdaj · bezpečné potvrdenie</p>
          <h1 className="mt-6 max-w-3xl text-[clamp(3.2rem,8vw,7rem)] leading-[0.88] font-medium tracking-[-0.06em] text-balance">
            Skontrolujte a potvrďte protokol.
          </h1>
        </div>
        <div className="border-t border-ink/15 pt-5 text-sm leading-relaxed text-ink/58">
          <p className="font-medium text-ink">Protokol {payload.protocol_code || '—'}</p>
          {expiresAt && <p className="mt-1">Platnosť do {expiresAt}</p>}
          <p className="mt-4">Odkaz je jednorazový a nesprístupňuje PDF, adresu ani fotografie.</p>
        </div>
      </header>

      <form onSubmit={submit} className="mx-auto mt-12 max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
          <section className="rounded-[1.7rem] border border-ink/12 bg-white/55 p-6 sm:p-8">
            <p className="text-sm font-medium text-ink/50">01 · Identita a rozhodnutie</p>
            <label htmlFor="name" className="mt-7 block text-sm font-medium">Meno podpisujúcej osoby</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={160}
              required
              className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3.5 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
            />
            <label htmlFor="note" className="mt-5 block text-sm font-medium">
              Poznámka alebo dôvod odmietnutia <span className="font-normal text-ink/42">· voliteľné</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={2000}
              rows={5}
              className="mt-2 w-full resize-y rounded-xl border border-ink/15 bg-paper px-4 py-3.5 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
            />
          </section>

          <section className="rounded-[1.7rem] border border-ink/12 bg-white/55 p-6 sm:p-8">
            <p className="text-sm font-medium text-ink/50">02 · Podpis</p>
            <p className="mt-5 text-sm leading-relaxed text-ink/58">Podpis je potrebný iba pri schválení. Môžete ho nakresliť alebo vložiť svoje napísané meno.</p>
            <canvas
              ref={canvasRef}
              width={1200}
              height={360}
              aria-label="Podpisová plocha"
              onPointerDown={beginSignature}
              onPointerMove={drawSignature}
              onPointerUp={endSignature}
              onPointerCancel={endSignature}
              className="mt-4 h-44 w-full touch-none rounded-2xl border border-ink/15 bg-white"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={useTypedSignature}
                className="min-h-11 rounded-full border border-ink/15 px-5 text-sm font-medium transition hover:border-terracotta hover:text-terracotta"
              >
                Použiť meno ako podpis
              </button>
              <button
                type="button"
                onClick={clearSignature}
                className="min-h-11 rounded-full border border-ink/15 px-5 text-sm font-medium transition hover:border-terracotta hover:text-terracotta"
              >
                Vymazať podpis
              </button>
            </div>
          </section>
        </div>

        <label className="mt-8 flex items-start gap-3 border-t border-ink/12 pt-8 text-sm leading-relaxed text-ink/60">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 size-4 accent-terracotta"
          />
          <span>Dostal/a som PDF s týmto číslom, prečítal/a som ho a súhlasím s uložením môjho rozhodnutia a prípadného podpisu.</span>
        </label>

        {submitError && (
          <p role="alert" className="mt-5 rounded-xl bg-[#f1dfda] px-4 py-3 text-sm text-[#7d3428]">{submitError}</p>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_2fr]">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void respond('rejected')}
            className="min-h-14 rounded-full border border-ink/15 bg-paper px-6 font-medium text-ink transition hover:border-terracotta hover:text-terracotta disabled:cursor-wait disabled:opacity-55"
          >
            Odmietnuť
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-14 rounded-full bg-ink px-6 font-medium text-paper transition hover:bg-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta disabled:cursor-wait disabled:opacity-55"
          >
            {submitting ? 'Bezpečne ukladám…' : 'Schváliť a podpísať'}
          </button>
        </div>
      </form>
    </main>
  )
}

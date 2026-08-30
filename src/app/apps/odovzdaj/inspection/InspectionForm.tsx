'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

type InspectionPayload = {
  status?: string
  address_label?: string
  expected_name?: string
  room_names?: string[]
  expires_at?: string
  title?: string
  detail?: string
  error?: string
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
        <p className="font-medium text-ink/55">Odovzdaj · samokontrola</p>
        <h1 className="mt-5 text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.92] font-medium tracking-[-0.055em] text-balance">
          {title}
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/62">
          {detail}
        </p>
      </div>
    </main>
  )
}

export function InspectionForm({ token }: { token: string }) {
  const [payload, setPayload] = useState<InspectionPayload | null>(null)
  const [loadError, setLoadError] = useState<InspectionPayload | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState<InspectionPayload | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/odovzdaj/tenant-inspection?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const value = (await response.json()) as InspectionPayload
        if (!response.ok) throw value
        if (value.status === 'submitted') setSubmitted(value)
        else setPayload(value)
      })
      .catch((error: InspectionPayload | Error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadError(
          'error' in error
            ? error
            : {
                error: 'Služba nie je dostupná',
                detail: 'Skúste to o chvíľu znova.',
              },
        )
      })
    return () => controller.abort()
  }, [token])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formRef.current || submitting) return
    setSubmitError('')

    const files = Array.from(
      formRef.current.querySelectorAll<HTMLInputElement>('input[type="file"]'),
    ).flatMap((input) => Array.from(input.files ?? []))
    if (files.some((file) => file.size > 8 * 1024 * 1024)) {
      setSubmitError('Jedna fotografia môže mať najviac 8 MB.')
      return
    }
    if (files.reduce((sum, file) => sum + file.size, 0) > 32 * 1024 * 1024) {
      setSubmitError('Fotografie spolu môžu mať najviac 32 MB.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(
        `/api/odovzdaj/tenant-inspection?token=${encodeURIComponent(token)}`,
        { method: 'POST', body: new FormData(formRef.current) },
      )
      const value = (await response.json()) as InspectionPayload
      if (!response.ok) throw value
      setSubmitted(value)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const value = error as InspectionPayload
      setSubmitError(
        value.detail ?? 'Kontrolu sa nepodarilo odoslať. Skúste to znova.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <ResultCard
        title={submitted.title ?? 'Kontrola bola odoslaná'}
        detail={
          submitted.detail ??
          'Ďakujeme. Vaše odpovede boli bezpečne zaznamenané.'
        }
        success
      />
    )
  }
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
        <p className="font-medium text-ink/55">Odovzdaj · samokontrola</p>
        <div className="mt-7 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-terracotta" />
        </div>
        <p className="mt-5 text-ink/58">Bezpečne načítavam kontrolu…</p>
      </main>
    )
  }

  const rooms = payload.room_names ?? []
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
      <header className="mx-auto grid max-w-6xl gap-10 border-b border-ink/12 pb-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-20">
        <div>
          <p className="font-medium text-ink/55">Odovzdaj · bezpečná samokontrola</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3.2rem,8vw,7.2rem)] leading-[0.88] font-medium tracking-[-0.06em] text-balance">
            {payload.address_label || 'Kontrola priestorov'}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink/62">
            {payload.expected_name ? `${payload.expected_name}, prejdite` : 'Prejdite'}{' '}
            jednotlivé priestory, označte stav a podľa potreby pridajte poznámku
            alebo fotografiu.
          </p>
        </div>
        <div className="border-t border-ink/15 pt-5 text-sm leading-relaxed text-ink/58">
          <p>{rooms.length} priestorov</p>
          {expiresAt && <p className="mt-1">Platnosť do {expiresAt}</p>}
          <p className="mt-4">
            Odkaz je jednorazový. Odovzdaj neposkytuje automatický technický ani
            právny posudok.
          </p>
        </div>
      </header>

      <form
        ref={formRef}
        onSubmit={submit}
        className="mx-auto mt-12 max-w-6xl"
        encType="multipart/form-data"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {rooms.map((room, index) => (
            <fieldset
              key={`${room}-${index}`}
              className="rounded-[1.6rem] border border-ink/12 bg-white/55 p-5 sm:p-7"
            >
              <legend className="px-2 text-sm font-medium text-ink/45">
                {String(index + 1).padStart(2, '0')}
              </legend>
              <h2 className="text-2xl font-medium tracking-[-0.025em]">{room}</h2>

              <label
                htmlFor={`condition_${index}`}
                className="mt-7 block text-sm font-medium"
              >
                Stav priestoru
              </label>
              <select
                id={`condition_${index}`}
                name={`condition_${index}`}
                required
                defaultValue="ok"
                className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3.5 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
              >
                <option value="ok">V poriadku</option>
                <option value="issue">Našiel/našla som problém</option>
                <option value="unable">Neviem skontrolovať</option>
              </select>

              <label
                htmlFor={`note_${index}`}
                className="mt-5 block text-sm font-medium"
              >
                Poznámka <span className="font-normal text-ink/42">· voliteľná</span>
              </label>
              <textarea
                id={`note_${index}`}
                name={`note_${index}`}
                maxLength={2000}
                rows={4}
                placeholder="Popíšte stav alebo problém…"
                className="mt-2 w-full resize-y rounded-xl border border-ink/15 bg-paper px-4 py-3.5 outline-none placeholder:text-ink/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
              />

              <label
                htmlFor={`photo_${index}`}
                className="mt-5 block text-sm font-medium"
              >
                Fotografia <span className="font-normal text-ink/42">· voliteľná, max. 8 MB</span>
              </label>
              <input
                id={`photo_${index}`}
                name={`photo_${index}`}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/heif"
                capture="environment"
                className="mt-2 block w-full rounded-xl border border-dashed border-ink/20 bg-paper px-4 py-4 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-medium file:text-paper"
              />
            </fieldset>
          ))}
        </div>

        <div className="mt-8 grid gap-7 border-t border-ink/12 pt-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/56">
            Odoslaním sprístupníte odpovede a priložené fotografie vlastníkovi
            odkazu. Dáta sa uchovávajú v súkromnom úložisku a odkaz po odoslaní
            nemožno použiť znova.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-14 rounded-full bg-ink px-6 font-medium text-paper transition hover:bg-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta disabled:cursor-wait disabled:opacity-55"
          >
            {submitting ? 'Bezpečne odosielam…' : 'Odoslať kontrolu'}
          </button>
        </div>
        {submitError && (
          <p role="alert" className="mt-5 rounded-xl bg-[#f1dfda] px-4 py-3 text-sm text-[#7d3428]">
            {submitError}
          </p>
        )}
      </form>
    </main>
  )
}

import Link from 'next/link'

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <article className="px-4 pt-36 pb-32 sm:px-6 sm:pt-44 md:pb-48">
      <header className="mx-auto max-w-5xl border-b border-ink/12 pb-12 sm:pb-16">
        <Link
          href="/"
          className="text-sm font-medium text-ink/50 hover:text-ink"
        >
          Gabriel Falis
        </Link>
        <h1 className="mt-7 max-w-4xl text-5xl leading-[0.96] font-medium tracking-[-0.05em] sm:text-7xl">
          {title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink/60">
          {intro}
        </p>
        <p className="mt-8 text-sm text-ink/45">Effective August 16, 2026</p>
      </header>
      <div className="legal-prose mx-auto mt-14 max-w-5xl">{children}</div>
    </article>
  )
}

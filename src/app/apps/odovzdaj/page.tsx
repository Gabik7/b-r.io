import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

import { createPageMetadata } from '@/lib/metadata'

const title = 'Odovzdaj — Property Handover Reports for iPhone'
const description =
  'Create clear property handover and inspection reports with evidence, meter readings, keys, signatures, PDF export, optional cloud sync, and team workspaces.'

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/apps/odovzdaj',
  heroTitle: 'Property handovers without paper or stress.',
})

const capabilities = [
  ['Inspect clearly', 'Rooms, components, meter readings, keys, photos, annotations, and neutral on-device note suggestions.'],
  ['Produce useful evidence', 'A professional PDF, bilingual report options, revisions, comparisons, and bulk export.'],
  ['Choose your level', 'Free for the first report, Lifetime for unlimited local work, Annual for cloud, and Team for shared operations.'],
]

export default function OdovzdajPage() {
  return (
    <main className="px-4 pt-36 pb-28 sm:px-6 sm:pt-44 md:pb-40">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-10 border-b border-ink/12 pb-16 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
          <div>
            <p className="mb-6 text-sm font-medium tracking-[0.16em] text-ink/48 uppercase">
              Native iOS · Preparing for launch
            </p>
            <h1 className="max-w-5xl text-[clamp(4rem,10vw,9.5rem)] leading-[0.84] font-medium tracking-[-0.065em] text-balance">
              Odovzdaj.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-ink/62">
            A local-first workspace for property handovers, inspections, and
            defensible reports—simple enough on site, polished enough to send.
          </p>
        </header>

        <section className="grid gap-10 border-b border-ink/12 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
          <h2 className="text-lg font-medium">Built around the report</h2>
          <div className="grid gap-12 md:grid-cols-3">
            {capabilities.map(([heading, body], index) => (
              <article key={heading}>
                <p className="text-xs text-ink/38">0{index + 1}</p>
                <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em]">
                  {heading}
                </h3>
                <p className="mt-4 leading-relaxed text-ink/58">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
          <h2 className="text-lg font-medium">Privacy by product design</h2>
          <div className="max-w-3xl">
            <p className="text-[clamp(2rem,4vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
              No account is required for local reports. Cloud remains explicit,
              paid, and removable.
            </p>
            <nav className="mt-12 flex flex-wrap gap-x-8 gap-y-4" aria-label="Odovzdaj legal and support links">
              {[
                ['Privacy details', '/privacy#odovzdaj'],
                ['Product terms', '/terms#odovzdaj'],
                ['Support', '/support#odovzdaj'],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="text-link">
                  {label}
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </main>
  )
}

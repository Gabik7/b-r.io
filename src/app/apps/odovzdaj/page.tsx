import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

import { JsonLd } from '@/components/JsonLd'
import { ProjectArtwork } from '@/components/ProjectArtwork'
import { createPageMetadata, getSiteUrl } from '@/lib/metadata'
import { projects, site } from '@/lib/site'

const odovzdaj = projects.find((project) => project.artwork === 'odovzdaj')!
const title = 'Odovzdaj — Property Handover & Inspection App'
const description =
  'A premium native iPhone and iPad app for property handovers, evidence photos, meter readings, signatures, recurring maintenance, and clear PDF records.'
const features = [
  ['Guided handovers', 'Rooms, condition, keys, meters, people, signatures, and review in one calm flow.'],
  ['Evidence that stays useful', 'Photos, annotations, integrity hashes, comparisons, and polished PDF export.'],
  ['Property operations', 'Recurring maintenance, safety checks, asset passports, providers, costs, and reminders.'],
  ['Optional secure cloud', 'Private PDF backup, Team workspaces, remote approval, and tenant self-inspection for eligible plans.'],
]
const architecture = [
  ['Native foundation', 'Swift 6, SwiftUI, SwiftData, PDFKit, PencilKit, and Apple frameworks. Requires iOS or iPadOS 18 or later.'],
  ['Local-first by design', 'Drafts, evidence, signatures, PDFs, reminders, and history stay on the device unless you deliberately use a cloud feature.'],
  ['On-device assistance', 'Meter OCR, photo checks, and neutral note suggestions use Apple Vision on the device. Protocol content is not sent to an external AI model.'],
  ['Optional protected services', 'Sign in with Apple and an EU-hosted Supabase project provide private storage, owner-scoped database access, and short-lived server workflows. RevenueCat verifies eligible purchases.'],
]

export const metadata: Metadata = createPageMetadata({
  title,
  socialTitle: title,
  description,
  path: '/apps/odovzdaj',
  heroTitle: 'A property record people can actually finish.',
})

export default function OdovzdajPage() {
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/apps/odovzdaj`

  return (
    <div className="px-4 pt-36 pb-28 sm:px-6 sm:pt-44 md:pb-40">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          '@id': `${pageUrl}#app`,
          name: 'Odovzdaj',
          url: pageUrl,
          image: `${siteUrl}/projects/odovzdaj.png`,
          description,
          applicationCategory: 'BusinessApplication',
          applicationSubCategory: 'Property handover and operations',
          operatingSystem: 'iOS 18 or later',
          isAccessibleForFree: true,
          author: {
            '@type': 'Person',
            '@id': `${siteUrl}/#gabriel-falis`,
            name: site.fullName,
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            description: 'Free download with optional Odovzdaj Pro purchases',
          },
          featureList: features.map(([name]) => name),
        }}
      />

      <header className="mx-auto grid max-w-7xl gap-12 border-b border-ink/12 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.52fr)] lg:items-end lg:gap-20">
        <div>
          <p className="font-medium text-ink/58">
            Native iPhone & iPad app · Preparing for launch
          </p>
          <h1 className="mt-7 max-w-5xl text-[clamp(3.8rem,9vw,8.8rem)] leading-[0.86] font-medium tracking-[-0.06em] text-balance">
            Handover, documented properly.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink/66">
            Odovzdaj turns a stressful property handover into a guided record,
            then keeps maintenance and evidence organised long after the keys
            change hands.
          </p>
        </div>
        <ProjectArtwork project={odovzdaj} priority />
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 border-b border-ink/12 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
        <h2 className="text-lg font-medium">Built for the full lifecycle</h2>
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {features.map(([heading, body]) => (
            <article key={heading} className="border-t border-ink/12 pt-6">
              <h3 className="text-2xl font-medium tracking-[-0.025em]">{heading}</h3>
              <p className="mt-4 leading-relaxed text-ink/60">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 border-b border-ink/12 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
        <h2 className="text-lg font-medium">Technical foundation</h2>
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {architecture.map(([heading, body]) => (
            <article key={heading} className="border-t border-ink/12 pt-6">
              <h3 className="text-2xl font-medium tracking-[-0.025em]">{heading}</h3>
              <p className="mt-4 leading-relaxed text-ink/60">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
        <h2 className="text-lg font-medium">Privacy by default</h2>
        <div>
          <p className="max-w-3xl text-[clamp(2rem,4vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
            Local-first records. Cloud only when you explicitly choose it.
          </p>
          <p className="mt-7 max-w-3xl text-lg leading-relaxed text-ink/62">
            The core app works without an account. Optional cloud features use
            Sign in with Apple, owner-scoped database access, and private file
            storage. The app contains no advertising, cross-app tracking,
            third-party analytics, external crash-reporting SDK, or remote AI
            processing.
          </p>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/privacy#odovzdaj" className="text-link">
              Privacy details <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/terms#odovzdaj" className="text-link">
              Terms <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/support#odovzdaj" className="text-link">
              Support <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

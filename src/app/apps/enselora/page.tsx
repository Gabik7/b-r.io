import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

import { JsonLd } from '@/components/JsonLd'
import { ProjectArtwork } from '@/components/ProjectArtwork'
import { createPageMetadata, getSiteUrl } from '@/lib/metadata'
import { projects, site } from '@/lib/site'

const enselora = projects.find((project) => project.artwork === 'enselora')!

const title = 'ENSELORA — AI Outfit Stylist & Digital Wardrobe'
const description =
  'ENSELORA is a privacy-first iPhone wardrobe app that creates outfits from clothes you own using weather, plans, and optional AI styling.'

const faqs = [
  {
    question: 'What is ENSELORA?',
    answer:
      'ENSELORA is a digital wardrobe and outfit-planning app for iPhone. It organises clothes you already own and suggests wearable combinations for your style, plans, and local weather.',
  },
  {
    question: 'Does ENSELORA require an account?',
    answer:
      'No. The core app works without an account and stores wardrobe data locally. Sign in with Apple is optional and is used only when an eligible ENSELORA+ user chooses cloud sync.',
  },
  {
    question: 'Where are wardrobe photos stored?',
    answer:
      'Wardrobe photos stay on the iPhone by default. If an ENSELORA+ user enables cloud sync, clothing photos and wardrobe records can be stored in that user’s private Supabase account. Try-On person photos and Try-On history are not synced.',
  },
  {
    question: 'Does ENSELORA send photos to AI services?',
    answer:
      'Only when the user chooses a remote AI feature and gives the required consent. Google Gemini may process clothing recognition and outfit composition, while Replicate may process fallback background removal or virtual Try-On.',
  },
  {
    question: 'How can I export or delete my ENSELORA data?',
    answer:
      'The app provides controls to export data, delete local data, and delete an optional cloud account. Cloud account deletion removes cloud records and cloud clothing photos associated with the account.',
  },
  {
    question: 'Is ENSELORA available on the App Store?',
    answer:
      'ENSELORA is currently preparing for launch. The App Store link will be added here only after the public listing is available.',
  },
]

export const metadata: Metadata = createPageMetadata({
  title,
  socialTitle: title,
  description,
  path: '/apps/enselora',
  heroTitle: 'ENSELORA — wear more of what you own.',
})

export default function EnseloraPage() {
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/apps/enselora`

  return (
    <div className="px-4 pt-36 pb-28 sm:px-6 sm:pt-44 md:pb-40">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'SoftwareApplication',
              '@id': `${pageUrl}#app`,
              name: 'ENSELORA',
              alternateName: 'ENSELORA: AI Outfit Stylist',
              url: pageUrl,
              image: `${siteUrl}/projects/enselora.png`,
              description,
              applicationCategory: 'LifestyleApplication',
              applicationSubCategory: 'Digital wardrobe and outfit planner',
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
                description:
                  'Free download with optional ENSELORA+ subscription',
              },
              featureList: [
                'Local-first digital wardrobe',
                'Outfit suggestions from clothes you own',
                'Weather-aware outfit planning',
                'Optional Sign in with Apple and cloud sync',
                'Optional AI clothing analysis and virtual Try-On',
              ],
            },
            {
              '@type': 'FAQPage',
              '@id': `${pageUrl}#faq`,
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ],
        }}
      />

      <header className="mx-auto grid max-w-7xl gap-12 border-b border-ink/12 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.52fr)] lg:items-end lg:gap-20">
        <div>
          <p className="font-medium text-ink/58">
            Native iPhone app · Preparing for launch
          </p>
          <h1 className="mt-7 max-w-5xl text-[clamp(3.8rem,9vw,8.8rem)] leading-[0.86] font-medium tracking-[-0.06em] text-balance">
            Your wardrobe, ready for today.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink/66">
            ENSELORA turns the clothes you own into a private digital wardrobe
            and practical outfits for your weather, plans, and personal style.
          </p>
        </div>
        <ProjectArtwork project={enselora} priority />
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 border-b border-ink/12 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
        <h2 className="text-lg font-medium">What It Does</h2>
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {[
            [
              'Builds your wardrobe',
              'Add real clothing with the camera or photo library, clean up the image, and keep useful details with each item.',
            ],
            [
              'Plans wearable outfits',
              'Get combinations from your own clothes for today or the coming week, informed by style, occasion, and weather.',
            ],
            [
              'Learns from feedback',
              'Likes, dislikes, wear history, and item availability make later suggestions more relevant.',
            ],
            [
              'Keeps AI optional',
              'Core wardrobe data is local-first. Remote recognition, cloud sync, analytics, and Try-On each have a clear purpose and control.',
            ],
          ].map(([heading, body]) => (
            <article key={heading} className="border-t border-ink/12 pt-6">
              <h3 className="text-2xl font-medium tracking-[-0.025em]">
                {heading}
              </h3>
              <p className="mt-4 leading-relaxed text-ink/60">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 border-b border-ink/12 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
        <h2 className="text-lg font-medium">Privacy at a Glance</h2>
        <div>
          <p className="max-w-3xl text-[clamp(2rem,4vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
            Local by default. Optional services only when they serve a feature
            you choose.
          </p>
          <dl className="mt-12 divide-y divide-ink/12 border-y border-ink/12">
            {[
              [
                'No account required',
                'The core wardrobe and outfit experience works locally on iPhone.',
              ],
              [
                'Cloud sync is optional',
                'Sign in with Apple and private Supabase sync are available only when chosen.',
              ],
              [
                'AI use is disclosed',
                'Remote image or outfit processing runs only for the selected feature and with the relevant consent.',
              ],
              [
                'No cross-app tracking',
                'Optional analytics and crash diagnostics are off by default and do not use wardrobe photos or outfit text.',
              ],
              [
                'Export and deletion',
                'Controls are available for data export, local deletion, and optional cloud-account deletion.',
              ],
            ].map(([term, detail]) => (
              <div
                key={term}
                className="grid gap-2 py-6 sm:grid-cols-[0.34fr_0.66fr] sm:gap-10"
              >
                <dt className="font-medium">{term}</dt>
                <dd className="leading-relaxed text-ink/58">{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/privacy#enselora" className="text-link">
              ENSELORA Privacy Details
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/terms#enselora" className="text-link">
              ENSELORA Terms
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/support#enselora" className="text-link">
              ENSELORA Support
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-24">
        <h2 className="text-lg font-medium">Frequently Asked Questions</h2>
        <div className="divide-y divide-ink/12 border-y border-ink/12">
          {faqs.map((faq) => (
            <article key={faq.question} className="py-7">
              <h3 className="text-xl font-medium tracking-[-0.02em]">
                {faq.question}
              </h3>
              <p className="mt-3 max-w-3xl leading-relaxed text-ink/60">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

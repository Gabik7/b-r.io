import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline'

import { createPageMetadata } from '@/lib/metadata'
import { projects, site } from '@/lib/site'

const title = 'App Support for Odovzdaj, ENSELORA, Setlyvo & ServiceBook'
const description =
  'Contact Gabriel Falis for ENSELORA, Odovzdaj, Setlyvo, and ServiceBook support, subscriptions, privacy requests, account deletion, and technical issues.'

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/support',
  heroTitle: 'Direct support for apps by Gabriel Falis.',
})

const topics = [
  {
    title: 'A feature is not working',
    body: 'Include the app name, device model, operating-system version, app version, and the steps that led to the issue.',
  },
  {
    title: 'Purchase or subscription',
    body: 'Apple processes App Store billing and refunds. I can help diagnose access problems, but I cannot see your payment-card details.',
  },
  {
    title: 'Privacy or account request',
    body: 'Email me to ask about your information, request an export or deletion, or withdraw an optional consent.',
  },
  {
    title: 'Odovzdaj secure link',
    body: 'For an approval or tenant self-inspection link, include only the protocol number and link status. Do not email its token or a private PDF.',
  },
]

export default function SupportPage() {
  return (
    <div className="px-4 pt-36 pb-28 sm:px-6 sm:pt-44 md:pb-40">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-10 border-b border-ink/12 pb-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
          <h1 className="max-w-5xl text-[clamp(3.8rem,9vw,8.8rem)] leading-[0.86] font-medium tracking-[-0.06em] text-balance">
            Direct app support.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink/62">
            Your message goes to the person building the product. Include the
            app name and a few useful details so I can respond clearly.
          </p>
        </header>

        <section className="grid gap-10 border-b border-ink/12 py-14 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-20">
          <h2 className="text-lg font-medium">Contact</h2>
          <div>
            <Link
              href={`mailto:${site.email}?subject=App%20support%20request`}
              className="group inline-flex max-w-full items-center gap-3 text-[clamp(2rem,5vw,5rem)] leading-none font-medium tracking-[-0.05em] underline decoration-ink/18 underline-offset-[0.15em] transition-colors hover:decoration-ink"
            >
              <span className="break-all">{site.email}</span>
              <ArrowUpRightIcon
                className="hidden size-[0.65em] shrink-0 sm:block"
                aria-hidden="true"
              />
            </Link>
            <p className="mt-7 max-w-2xl leading-relaxed text-ink/58">
              Please do not send passwords, full payment details, or other
              sensitive information. A screenshot is useful when it does not
              contain private data.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink/58">
              Odovzdaj cloud users can delete individual backups, cancel secure
              links, or permanently delete the cloud account directly in Pro
              Cloud. If the app is inaccessible, use the email above and include
              “Odovzdaj privacy request” in the subject.
            </p>
          </div>
        </section>

        <section className="grid gap-10 border-b border-ink/12 py-14 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-20">
          <h2 className="text-lg font-medium">Supported apps</h2>
          <ul className="divide-y divide-ink/12 border-y border-ink/12">
            {projects.map((project) => (
              <li
                key={project.name}
                id={project.artwork}
                className="grid scroll-mt-24 gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-2xl font-medium tracking-[-0.025em]">
                    {project.name}
                  </p>
                  <p className="mt-1 text-sm text-ink/52">{project.status}</p>
                </div>
                {project.appStoreHref ? (
                  <Link
                    href={project.appStoreHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    App Store
                    <ArrowUpRightIcon className="size-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="text-sm text-ink/46">
                    Before public release
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="py-14 lg:py-20">
          <h2 className="text-lg font-medium">What to include</h2>
          <div className="mt-10 grid border-y border-ink/12 md:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic, index) => (
              <article
                key={topic.title}
                className="border-b border-ink/12 py-8 last:border-b-0 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <p className="text-xs text-ink/38">0{index + 1}</p>
                <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em]">
                  {topic.title}
                </h3>
                <p className="mt-4 leading-relaxed text-ink/58">{topic.body}</p>
              </article>
            ))}
          </div>
        </section>

        <nav
          aria-label="Support resources"
          className="grid border-t border-ink/12 sm:grid-cols-3"
        >
          {[
            ['Privacy Policy', '/privacy'],
            ['Terms of Service', '/terms'],
            ['Apple billing support', 'https://support.apple.com/billing'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-16 items-center justify-between border-b border-ink/12 sm:border-r sm:px-5 sm:last:border-r-0"
            >
              {label}
              <ArrowRightIcon
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

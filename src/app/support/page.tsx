import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'App Support',
  description:
    'Support and contact information for apps published by Gabriel Falis.',
}

const topics = [
  {
    title: 'Something is not working',
    body: 'Include the app name, device model, iOS or macOS version, and the steps that lead to the issue.',
  },
  {
    title: 'Billing or App Store purchase',
    body: 'Apple processes App Store payments and refunds. I can help identify the right next step, but cannot access your payment details.',
  },
  {
    title: 'Privacy request',
    body: 'You can ask about your data, request access or deletion, or withdraw consent by email.',
  },
]

export default function SupportPage() {
  return (
    <div className="px-4 pt-36 pb-32 sm:px-6 sm:pt-44 md:pb-48">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-12 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-ink/50">App support</p>
            <h1 className="mt-6 max-w-5xl text-[clamp(3.6rem,8vw,8rem)] leading-[0.9] font-medium tracking-[-0.055em]">
              Help when you need it.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-ink/60">
            Support for mobile and web apps published by Gabriel Falis. Send a
            message and include the app name so I can help quickly.
          </p>
        </header>

        <section className="mt-20 grid gap-5 lg:grid-flow-dense lg:grid-cols-12">
          <Link
            href="mailto:falis.gabriel@gmail.com?subject=App%20support%20request"
            className="group flex min-h-[26rem] flex-col justify-between rounded-[2rem] bg-cobalt p-8 text-white sm:p-12 lg:col-span-7"
          >
            <div className="flex items-center justify-between">
              <EnvelopeIcon className="size-8" />
              <ArrowUpRightIcon className="size-6 transition-transform duration-500 group-hover:rotate-45" />
            </div>
            <div>
              <p className="text-sm text-white/60">Email support</p>
              <p className="mt-3 text-3xl font-medium tracking-[-0.035em] break-all sm:text-5xl">
                falis.gabriel@gmail.com
              </p>
            </div>
          </Link>

          <div className="rounded-[2rem] bg-lime p-8 sm:p-12 lg:col-span-5">
            <p className="text-sm font-medium text-ink/50">
              Straight to the developer
            </p>
            <p className="mt-20 text-5xl font-medium tracking-[-0.045em] sm:mt-28 sm:text-6xl">
              Direct support. No ticket maze.
            </p>
          </div>

          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-[2rem] border border-ink/10 p-7 sm:p-9 lg:col-span-4"
            >
              <h2 className="text-2xl font-medium tracking-[-0.025em]">
                {topic.title}
              </h2>
              <p className="mt-4 leading-relaxed text-ink/60">{topic.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 border-t border-ink/12 pt-10">
          <h2 className="text-3xl font-medium tracking-[-0.035em]">
            Useful links
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-xl border border-ink/12 px-5 py-3 hover:bg-ink hover:text-paper"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="rounded-xl border border-ink/12 px-5 py-3 hover:bg-ink hover:text-paper"
              href="/terms"
            >
              Terms of Service
            </Link>
            <Link
              className="rounded-xl border border-ink/12 px-5 py-3 hover:bg-ink hover:text-paper"
              href="https://support.apple.com/billing"
            >
              Apple billing support
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

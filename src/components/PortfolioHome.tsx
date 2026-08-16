import Link from 'next/link'
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline'

import { ProjectArtwork } from '@/components/ProjectArtwork'
import { ProjectLinks } from '@/components/ProjectLinks'
import { projects, site } from '@/lib/site'

export function PortfolioHome() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <section className="px-4 pt-36 pb-24 sm:px-6 sm:pt-44 lg:pb-32">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end lg:gap-20">
          <div>
            <p className="max-w-xl text-base font-medium text-ink/58 sm:text-lg">
              Gabriel Falis · Independent developer in Slovakia
            </p>
            <h1 className="mt-7 max-w-5xl text-[clamp(3.6rem,8.2vw,8.4rem)] leading-[0.86] font-medium tracking-[-0.06em] text-balance">
              I build useful apps and the systems behind them.
            </h1>
            <p className="mt-9 max-w-2xl text-lg leading-relaxed text-ink/64 sm:text-xl">
              My work spans native iOS, web products, and the less visible
              details that make an app dependable after launch.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="#work" className="button-primary">
                See the work
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
              <Link href={`mailto:${site.email}`} className="button-secondary">
                Email me
              </Link>
            </div>
          </div>

          <aside className="current-work" aria-label="Current work">
            <div className="flex items-center justify-between border-b border-paper/15 pb-5">
              <p className="text-sm font-medium text-paper/60">Current work</p>
              <span className="status-dot">Active</span>
            </div>
            <ol className="divide-y divide-paper/12">
              {projects.map((project, index) => (
                <li
                  key={project.name}
                  className="grid grid-cols-[1.5rem_1fr] gap-4 py-5"
                >
                  <span className="text-xs text-paper/35">0{index + 1}</span>
                  <div>
                    <p className="font-medium text-paper">{project.name}</p>
                    <p className="mt-1 text-sm text-paper/52">
                      {project.status}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-24 border-y border-ink/12 px-4 py-20 sm:px-6 md:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-24">
          <h2 className="text-lg font-medium">About</h2>
          <div>
            <p className="max-w-4xl text-[clamp(2rem,4vw,4.6rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
              I like products that solve a concrete problem, explain themselves,
              and keep earning trust after the first download.
            </p>
            <div className="mt-12 grid gap-8 border-t border-ink/12 pt-8 sm:grid-cols-2">
              <p className="max-w-md leading-relaxed text-ink/62">
                I work across product thinking, interface design, SwiftUI,
                React, TypeScript, APIs, release preparation, and support.
              </p>
              <p className="max-w-md leading-relaxed text-ink/62">
                This site is also the stable home for support, privacy, and
                terms for the apps I publish.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="px-4 py-24 sm:px-6 md:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-ink/12 pb-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="text-[clamp(3rem,6vw,6.4rem)] leading-[0.92] font-medium tracking-[-0.055em]">
                Products
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/60">
                One released app and two products currently moving toward their
                first public versions.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-link self-start md:self-auto"
            >
              All project details
              <ArrowUpRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div>
            {projects.map((project, index) => (
              <article
                key={project.name}
                className="project-row grid gap-9 py-12 md:grid-cols-[minmax(15rem,0.82fr)_minmax(0,1.18fr)] md:items-center md:gap-16 lg:py-16"
              >
                <ProjectArtwork project={project} priority={index === 0} />
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="font-medium">{project.status}</span>
                    <span className="text-ink/35" aria-hidden="true">
                      /
                    </span>
                    <span className="text-ink/52">{project.year}</span>
                  </div>
                  <h3 className="mt-5 text-5xl font-medium tracking-[-0.045em] sm:text-6xl">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-sm font-medium text-ink/48">
                    {project.label}
                  </p>
                  <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/64">
                    {project.description}
                  </p>
                  <div className="mt-9">
                    <ProjectLinks project={project} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-paper sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.62fr_0.38fr] lg:items-end lg:gap-24">
          <div>
            <h2 className="max-w-4xl text-[clamp(2.8rem,5.5vw,6rem)] leading-[0.94] font-medium tracking-[-0.05em] text-balance">
              Using one of my apps?
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/62">
              Get direct support, understand how information is handled, or
              review the terms that apply to apps published by Gabriel Falis.
            </p>
          </div>
          <nav aria-label="App help and legal information">
            <ul className="divide-y divide-paper/15 border-y border-paper/15">
              {[
                ['Support', '/support'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex min-h-16 items-center justify-between text-lg font-medium"
                  >
                    {label}
                    <ArrowRightIcon
                      className="size-5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 md:py-36">
        <div className="mx-auto max-w-7xl border-b border-ink/12 pb-16 sm:pb-20">
          <p className="max-w-2xl text-lg leading-relaxed text-ink/58">
            Have a product question, a collaboration in mind, or feedback on an
            app?
          </p>
          <Link
            href={`mailto:${site.email}`}
            className="mt-6 inline-flex items-center gap-3 text-[clamp(2.4rem,6vw,6rem)] leading-none font-medium tracking-[-0.05em] underline decoration-ink/18 underline-offset-[0.14em] transition-colors hover:decoration-ink"
          >
            {site.email}
            <ArrowUpRightIcon
              className="hidden size-[0.65em] sm:block"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'

import { projects } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected web and mobile projects by Gabriel Falis.',
}

export default function ProjectsPage() {
  return (
    <div className="px-4 pt-36 pb-32 sm:px-6 sm:pt-44 md:pb-48">
      <header className="mx-auto max-w-7xl">
        <p className="text-sm font-medium text-ink/50">Selected work</p>
        <h1 className="mt-6 max-w-5xl text-[clamp(3.6rem,8vw,8rem)] leading-[0.9] font-medium tracking-[-0.055em]">
          Products built with purpose.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/60">
          A small collection of native iOS experiments and independent product
          work. More releases will be added as they reach the App Store.
        </p>
      </header>

      <div className="mx-auto mt-24 max-w-7xl space-y-5">
        {projects.map((project, index) => (
          <Link
            key={project.name}
            href={project.href}
            className={`tone-${project.tone} group grid min-h-72 overflow-hidden rounded-[2rem] p-7 transition-transform duration-500 hover:-translate-y-1 sm:p-10 md:grid-cols-[0.18fr_0.32fr_0.5fr] md:items-end`}
          >
            <span className="text-sm font-medium text-ink/45">
              0{index + 1}
            </span>
            <div className="mt-12 md:mt-0">
              <p className="text-sm font-medium text-ink/55">{project.type}</p>
              <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                {project.name}
              </h2>
            </div>
            <div className="mt-8 flex items-end justify-between gap-8 md:mt-0">
              <p className="max-w-lg text-lg leading-relaxed text-ink/65">
                {project.description}
              </p>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/55 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRightIcon className="size-5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

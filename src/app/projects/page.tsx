import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { ProjectArtwork } from '@/components/ProjectArtwork'
import { ProjectLinks } from '@/components/ProjectLinks'
import { createPageMetadata, getSiteUrl } from '@/lib/metadata'
import { projects } from '@/lib/site'

const title = 'iOS Apps: ServiceBook, ENSELORA & Setlyvo'
const description =
  'Explore ServiceBook, ENSELORA, and Setlyvo: iPhone and web products designed and developed by Gabriel Falis in Slovakia.'

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/projects',
  heroTitle: 'ServiceBook, ENSELORA, and Setlyvo.',
})

export default function ProjectsPage() {
  const siteUrl = getSiteUrl()

  return (
    <div className="px-4 pt-36 pb-28 sm:px-6 sm:pt-44 md:pb-40">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Apps by Gabriel Falis',
          description,
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url:
              project.artwork === 'enselora'
                ? `${siteUrl}/apps/enselora`
                : project.websiteHref?.startsWith('http')
                  ? project.websiteHref
                  : `${siteUrl}/projects#${project.artwork}`,
            name: project.name,
          })),
        }}
      />
      <header className="mx-auto grid max-w-7xl gap-10 border-b border-ink/12 pb-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
        <h1 className="max-w-5xl text-[clamp(3.8rem,9vw,8.8rem)] leading-[0.86] font-medium tracking-[-0.06em] text-balance">
          Products in the real world.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink/62">
          Released work and products still being shaped. Status and download
          links stay explicit, so a concept never pretends to be a launch.
        </p>
      </header>

      <div className="mx-auto max-w-7xl">
        {projects.map((project, index) => (
          <article
            key={project.name}
            id={project.artwork}
            className="project-row grid scroll-mt-24 gap-10 py-14 md:grid-cols-[minmax(16rem,0.84fr)_minmax(0,1.16fr)] md:items-center md:gap-16 lg:py-20"
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
              <h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] leading-[0.94] font-medium tracking-[-0.05em]">
                {project.name}
              </h2>
              <p className="mt-3 text-sm font-medium text-ink/48">
                {project.label}
              </p>
              <p className="mt-7 max-w-2xl text-xl leading-relaxed text-ink/68">
                {project.description}
              </p>
              <p className="mt-5 max-w-2xl leading-relaxed text-ink/55">
                {project.detail}
              </p>
              <div className="mt-9">
                <ProjectLinks project={project} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

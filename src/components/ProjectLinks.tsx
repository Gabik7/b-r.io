import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'

import type { Project } from '@/lib/site'

export function ProjectLinks({ project }: { project: Project }) {
  const websiteIsExternal = project.websiteHref?.startsWith('http')

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {project.appStoreHref ? (
        <Link
          href={project.appStoreHref}
          className="button-primary"
          target="_blank"
          rel="noreferrer"
        >
          View on the App Store
          <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center text-sm font-medium text-ink/48">
          App Store link after release
        </span>
      )}

      {project.websiteHref ? (
        <Link
          href={project.websiteHref}
          className="text-link"
          target={websiteIsExternal ? '_blank' : undefined}
          rel={websiteIsExternal ? 'noreferrer' : undefined}
        >
          {project.websiteLabel}
          <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <Link href="/support" className="text-link">
          Ask about the project
        </Link>
      )}
    </div>
  )
}

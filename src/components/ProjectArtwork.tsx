import Image from 'next/image'

import type { Project } from '@/lib/site'

export function ProjectArtwork({
  project,
  priority = false,
}: {
  project: Project
  priority?: boolean
}) {
  return (
    <div
      className={`project-art project-art-${project.artwork}`}
      aria-hidden="true"
    >
      {project.icon ? (
        <Image
          src={project.icon}
          alt=""
          width={1024}
          height={1024}
          sizes="(max-width: 768px) 42vw, 18rem"
          priority={priority}
          className="project-icon"
        />
      ) : (
        <div className="setlyvo-mark">
          <span>{project.name.slice(0, 1)}</span>
        </div>
      )}
      <span className="project-art-name" translate="no">
        {project.name}
      </span>
    </div>
  )
}

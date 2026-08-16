import { getLinkMetadata } from '@/lib/link-metadata'
import { cn } from '@/lib/utils'

type OgLinkProps = Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & {
  url?: string
  href?: string
  /** Overrides the fetched og:title when there is no link text */
  title?: string
  /** Defaults to true. Pass false to skip the favicon. */
  favicon?: boolean
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function isExternalHttp(href?: string): href is string {
  return Boolean(href && /^https?:\/\//i.test(href))
}

export async function OgLink({
  url,
  href,
  title,
  favicon = true,
  children,
  className,
  ...props
}: OgLinkProps) {
  const targetHref = url ?? href
  const external = isExternalHttp(targetHref)
  const showFavicon = favicon !== false
  const needsMetadata = external && (showFavicon || (!children && !title))
  const meta = needsMetadata ? await getLinkMetadata(targetHref) : null
  const label =
    children ??
    title ??
    meta?.title ??
    (targetHref ? getHostname(targetHref) : null)

  return (
    <a
      href={targetHref}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline font-medium text-accent underline decoration-accent/20 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:decoration-accent',
        className,
      )}
      {...props}
    >
      {showFavicon && meta?.favicon ? (
        <span
          aria-hidden
          className="mr-1 inline-block size-[0.55em] translate-y-[-0.04em] rounded-full bg-current opacity-50"
        />
      ) : null}
      {label}
    </a>
  )
}

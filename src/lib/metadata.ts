import type { Metadata } from 'next'

import { ogSize } from '@/lib/og'
import { homeHeroTitle } from '@/lib/site-copy'

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production'
      ? 'https://gfcodes.com'
      : 'http://localhost:3000')

  return configuredUrl.replace(/\/$/, '')
}

export function createOgImageUrl(title: string) {
  return `${getSiteUrl()}/api/og?title=${encodeURIComponent(title)}`
}

export function createOpenGraphImages(title: string) {
  return [
    {
      url: createOgImageUrl(title),
      width: ogSize.width,
      height: ogSize.height,
      alt: title,
    },
  ]
}

export function createCoverOpenGraphImages(
  coverImage: string,
  alt: string,
  size?: { width: number; height: number },
) {
  return [
    {
      url: coverImage,
      alt,
      ...(size ? { width: size.width, height: size.height } : {}),
    },
  ]
}

export function createTwitterMetadata(
  title: string,
  imageUrl?: string,
): NonNullable<Metadata['twitter']> {
  return {
    card: 'summary_large_image',
    images: [imageUrl ?? createOgImageUrl(title)],
  }
}

export function createPageMetadata({
  title,
  description,
  path,
  socialTitle,
  heroTitle,
}: {
  title: Metadata['title']
  description: string
  path: `/${string}` | '/'
  socialTitle?: string
  heroTitle?: string
}): Metadata {
  const resolvedSocialTitle =
    socialTitle ?? (typeof title === 'string' ? title : 'Gabriel Falis')
  const imageTitle = heroTitle ?? resolvedSocialTitle

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: resolvedSocialTitle,
      description,
      type: 'website',
      url: path,
      images: createOpenGraphImages(imageTitle),
    },
    twitter: {
      ...createTwitterMetadata(
        resolvedSocialTitle,
        createOgImageUrl(imageTitle),
      ),
      title: resolvedSocialTitle,
      description,
    },
  }
}

export const siteOgImageTitle = homeHeroTitle

export const siteOpenGraphImages = createOpenGraphImages(siteOgImageTitle)

export const siteTwitterMetadata = createTwitterMetadata(
  'Gabriel Falis — Web & Mobile App Developer',
  createOgImageUrl(siteOgImageTitle),
)

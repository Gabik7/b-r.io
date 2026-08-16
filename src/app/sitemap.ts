import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/projects', '/support', '/privacy', '/terms'].map((path) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: new Date('2026-08-16'),
  }))
}

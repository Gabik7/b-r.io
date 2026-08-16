import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/metadata'

const pages = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/apps/enselora', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/projects', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.5, changeFrequency: 'monthly' },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: new Date('2026-08-16'),
    changeFrequency,
    priority,
  }))
}

import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { PortfolioHome } from '@/components/PortfolioHome'
import { createPageMetadata, getSiteUrl } from '@/lib/metadata'
import { site } from '@/lib/site'

const title = 'Gabriel Falis | iOS & Web App Developer'
const description =
  'Independent developer from Slovakia building ServiceBook, ENSELORA, Odovzdaj, and Setlyvo for iPhone and the web.'

export const metadata: Metadata = createPageMetadata({
  title: { absolute: title },
  socialTitle: title,
  description,
  path: '/',
  heroTitle: 'Useful iPhone and web products, built by Gabriel Falis.',
})

export default function Home() {
  const siteUrl = getSiteUrl()

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': `${siteUrl}/#profile`,
          url: siteUrl,
          name: title,
          description,
          dateModified: '2026-08-30',
          mainEntity: {
            '@type': 'Person',
            '@id': `${siteUrl}/#gabriel-falis`,
            name: site.fullName,
            url: siteUrl,
            email: `mailto:${site.email}`,
            homeLocation: {
              '@type': 'Country',
              name: site.location,
            },
            sameAs: [site.github],
            knowsAbout: [
              'iOS development',
              'SwiftUI',
              'Next.js',
              'TypeScript',
              'mobile app product development',
            ],
          },
        }}
      />
      <PortfolioHome />
    </>
  )
}

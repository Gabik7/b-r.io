import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { Layout } from '@/components/Layout'
import { getSiteUrl } from '@/lib/metadata'

import '@/styles/tailwind.css'

const cabinet = localFont({
  src: [
    { path: '../fonts/CabinetGrotesk-Regular.woff2', weight: '400' },
    { path: '../fonts/CabinetGrotesk-Medium.woff2', weight: '500' },
    { path: '../fonts/CabinetGrotesk-Bold.woff2', weight: '700' },
  ],
  variable: '--font-cabinet',
  display: 'swap',
})

const siteUrl = getSiteUrl()
const metadataBase = (() => {
  try {
    return new URL(siteUrl)
  } catch {
    return new URL('http://localhost:3000')
  }
})()
const title = 'Gabriel Falis | iOS & Web App Developer'
const description =
  'Independent iOS and web developer from Slovakia building ServiceBook, ENSELORA, Odovzdaj, and Setlyvo.'

export const metadata: Metadata = {
  metadataBase,
  title: { default: title, template: '%s — Gabriel Falis' },
  description,
  applicationName: 'Gabriel Falis',
  authors: [{ name: 'Gabriel Falis', url: '/' }],
  creator: 'Gabriel Falis',
  publisher: 'Gabriel Falis',
  category: 'technology',
  keywords: [
    'Gabriel Falis',
    'iOS developer Slovakia',
    'SwiftUI developer',
    'ENSELORA',
    'Odovzdaj',
    'ServiceBook',
    'Setlyvo',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title,
    description,
    siteName: 'Gabriel Falis',
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
  icons: {
    icon: [{ url: '/favicon/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f1e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cabinet.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

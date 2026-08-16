import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { Layout } from '@/components/Layout'

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const metadataBase = (() => {
  try {
    return new URL(siteUrl)
  } catch {
    return new URL('http://localhost:3000')
  }
})()
const title = 'Gabriel Falis — Web & Mobile App Developer'
const description =
  'Independent developer from Slovakia building thoughtful web and Apple-platform products.'

export const metadata: Metadata = {
  metadataBase,
  title: { default: title, template: '%s — Gabriel Falis' },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: '/',
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

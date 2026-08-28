import { getSiteUrl } from '@/lib/metadata'

export function GET() {
  const siteUrl = getSiteUrl()
  const content = `# Gabriel Falis

> Independent iOS and web developer in Slovakia. This is the official portfolio, product, support, privacy, and terms website for apps published by Gabriel Falis.

## Products

- ServiceBook: vehicle service history, fuel, expenses, documents, reminders, and maintenance guidance. Available on the App Store. Product site: https://carservicebook.app
- ENSELORA: a local-first iPhone digital wardrobe and outfit planner using clothes the user already owns. Preparing for launch. Product details: ${siteUrl}/apps/enselora
- Odovzdaj: a local-first iPhone app for rental handover checks, photos, signatures, and PDF protocols. Preparing for launch.
- Setlyvo: an adaptive iPhone training app built around equipment available in the user's gym. In development.

## ENSELORA

- Works without a required account and stores wardrobe data locally by default.
- Offers optional Sign in with Apple and private cloud sync for eligible ENSELORA+ users.
- Uses optional remote AI features only for actions chosen by the user and described in the privacy policy.
- Official privacy details: ${siteUrl}/privacy#enselora
- Official terms: ${siteUrl}/terms#enselora
- Official support: ${siteUrl}/support#enselora

## Odovzdaj

- Works without an account or backend and keeps protocol data on the user's device.
- Creates local PDF handover records from details, room checks, meter readings, keys, photos, and signatures.
- Official privacy details: ${siteUrl}/privacy#odovzdaj
- Official terms: ${siteUrl}/terms#odovzdaj
- Official support: ${siteUrl}/support#odovzdaj

## Official pages

- Portfolio: ${siteUrl}
- Projects: ${siteUrl}/projects
- App support: ${siteUrl}/support
- Privacy policy: ${siteUrl}/privacy
- Terms of service: ${siteUrl}/terms

## Contact

- Gabriel Falis
- Email: falis.gabriel@gmail.com
- GitHub: https://github.com/Gabik7
`

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

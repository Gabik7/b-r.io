# Gabriel Falis — Portfolio

Personal portfolio and App Store support site for Gabriel Falis.

## Included pages

- Portfolio homepage
- Projects: ServiceBook, ENSELORA, and Setlyvo
- ENSELORA product page and FAQ
- App support
- Shared Privacy Policy with app-specific sections
- Shared Terms of Service with app-specific sections
- Search-engine sitemap, structured data, robots rules, and `llms.txt`

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Locally hosted Cabinet Grotesk

## Local development

```bash
npm install
npm run dev
```

The production build uses Next.js with Webpack for predictable builds across
local and hosted environments.

Set `NEXT_PUBLIC_SITE_URL` to one stable production domain before deployment so
canonical metadata, social cards, robots, the sitemap, and structured data all
use the same public origin. Vercel's production URL is used as a fallback when
the variable is not set; localhost is used only during local development.

Do not use `b-r.io` unless ownership and DNS are transferred: the domain still
serves the original developer's website and is not the canonical URL for this
project.

ServiceBook links to its own product website and live App Store listing.
ENSELORA and Setlyvo are marked as pre-release products until their public
listings exist; add those URLs in `src/lib/site.ts` after launch.

## ENSELORA App Store URLs

After the stable domain is connected, use these direct links in App Store
Connect and inside the app:

- Product/marketing URL: `https://YOUR_DOMAIN/apps/enselora`
- Privacy Policy URL: `https://YOUR_DOMAIN/privacy#enselora`
- Support URL: `https://YOUR_DOMAIN/support#enselora`
- Terms URL (if shown in the app or metadata): `https://YOUR_DOMAIN/terms#enselora`

The shared legal pages are designed to gain a new app-specific section for each
future product, so a separate legal domain is not required for every app.

## Before publishing

Review the legal text with a qualified professional before production use.
Whenever an app's data practices or vendors change, update its section and keep
the App Store privacy answers consistent with the shipped app and this policy.

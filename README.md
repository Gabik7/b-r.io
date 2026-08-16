# Gabriel Falis — Portfolio

Personal portfolio and App Store support site for Gabriel Falis.

## Included pages

- Portfolio homepage
- Projects: ServiceBook, ENSELORA, and Setlyvo
- App support
- Privacy Policy
- Terms of Service

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

Set `NEXT_PUBLIC_SITE_URL` to the production URL before deployment so metadata,
robots, and the sitemap use the correct domain.

ServiceBook links to its live App Store listing. ENSELORA and Setlyvo are marked
as pre-release products until their public listings exist; add those URLs in
`src/lib/site.ts` after launch.

## Before publishing

Review the privacy policy against the real data practices of every app that
links to it, including all analytics, crash reporting, accounts, advertising,
cloud storage, and other third-party SDKs. Keep each app's App Store privacy
answers consistent with the policy.

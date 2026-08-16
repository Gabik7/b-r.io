export const site = {
  name: 'Gabriel',
  fullName: 'Gabriel Falis',
  email: 'falis.gabriel@gmail.com',
  location: 'Slovakia',
  github: 'https://github.com/Gabik7',
} as const

export type Project = {
  name: string
  label: string
  description: string
  detail: string
  status:
    'Available on the App Store' | 'Preparing for launch' | 'In development'
  year: string
  icon: string | null
  artwork: 'servicebook' | 'enselora' | 'setlyvo'
  websiteHref: string | null
  appStoreHref: string | null
}

export const projects: Project[] = [
  {
    name: 'ServiceBook',
    label: 'Vehicle ownership · iPhone & web',
    description:
      'A practical home for service history, fuel, expenses, documents, reminders, and maintenance guidance.',
    detail:
      'Built for drivers who want the full story of a car in one place, from the next oil change to long-term running costs.',
    status: 'Available on the App Store',
    year: '2023—now',
    icon: '/projects/servicebook.png',
    artwork: 'servicebook',
    websiteHref: 'https://carservicebook.app',
    appStoreHref: 'https://apps.apple.com/us/app/car-service-book/id6468662179',
  },
  {
    name: 'ENSELORA',
    label: 'Personal wardrobe · Native iOS',
    description:
      'A local-first digital wardrobe that turns the clothes you own into useful outfits for your weather, plans, and style.',
    detail:
      'The app combines wardrobe organisation, daily outfit decisions, and optional AI features without turning into another shop.',
    status: 'Preparing for launch',
    year: '2026',
    icon: '/projects/enselora.png',
    artwork: 'enselora',
    websiteHref: 'https://enseloraapp.sk',
    appStoreHref: null,
  },
  {
    name: 'Setlyvo',
    label: 'Adaptive training · Native iOS',
    description:
      'A fitness companion that understands the equipment in front of you and builds a workout around it.',
    detail:
      'The current build focuses on the core loop: gym setup, fast workout logging, useful substitutions, and progression over time.',
    status: 'In development',
    year: '2026',
    icon: null,
    artwork: 'setlyvo',
    websiteHref: null,
    appStoreHref: null,
  },
]

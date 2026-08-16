export const site = {
  name: 'Gabriel',
  fullName: 'Gabriel Falis',
  email: 'falis.gabriel@gmail.com',
  location: 'Slovakia',
  github: 'https://github.com/Gabik7',
} as const

export const projects = [
  {
    name: 'JobBoard',
    type: 'Swift · iOS',
    description:
      'A native Swift project exploring a focused, straightforward job-search experience.',
    href: 'https://github.com/Gabik7/JobBoard',
    tone: 'cobalt',
  },
  {
    name: 'Real Estate',
    type: 'Swift · iOS',
    description:
      'An iOS concept for browsing property and real-estate information with less friction.',
    href: 'https://github.com/Gabik7/Real-Estate',
    tone: 'coral',
  },
  {
    name: 'Next release',
    type: 'Independent · In progress',
    description:
      'New Apple-platform products are being shaped, tested, and prepared for release.',
    href: '/support',
    tone: 'lime',
  },
] as const

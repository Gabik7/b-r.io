import Link from 'next/link'

const links = [
  { label: 'Projects', href: '/projects' },
  { label: 'ENSELORA', href: '/apps/enselora' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'GitHub', href: 'https://github.com/Gabik7' },
]

export function Footer() {
  return (
    <footer className="border-t border-ink/12 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="text-2xl font-medium tracking-tight">Gabriel Falis</p>
            <p className="mt-2 max-w-sm text-sm text-ink/55">
              Independent iOS and web product developer based in Slovakia.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/60">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="transition-colors hover:text-ink"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-ink/10 pt-5 text-xs text-ink/45">
          © {new Date().getFullYear()} Gabriel Falis. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

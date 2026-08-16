import Link from 'next/link'

const links = [
  { label: 'Projects', href: '/projects' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'GitHub', href: 'https://github.com/Gabik7' },
]

export function Footer() {
  return (
    <footer className="px-4 pb-6 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-ink px-6 py-10 text-paper sm:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="text-2xl font-medium tracking-tight">Gabriel Falis</p>
            <p className="mt-2 max-w-sm text-sm text-paper/60">
              Independent web and mobile app developer based in Slovakia.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-paper/70">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="transition-colors hover:text-paper"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-paper/10 pt-5 text-xs text-paper/45">
          © {new Date().getFullYear()} Gabriel Falis. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

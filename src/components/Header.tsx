'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { label: 'About', href: '/#about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Support', href: '/support' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="nav-surface mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
        <Link
          href="/"
          aria-label="Gabriel — home"
          className="group flex items-center gap-3 font-medium tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-sm font-bold text-paper transition-transform duration-300 group-hover:-rotate-3">
            GF
          </span>
          <span>Gabriel</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 transition-colors hover:bg-ink/5 ${
                    pathname === item.href ? 'bg-ink/5' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="mailto:falis.gabriel@gmail.com"
          className="hidden rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5 md:block"
        >
          Let&apos;s talk
        </Link>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="rounded-xl border border-ink/10 p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <XMarkIcon className="size-5" />
          ) : (
            <Bars3Icon className="size-5" />
          )}
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile navigation"
          className="nav-surface mx-auto mt-2 max-w-7xl rounded-2xl p-3 md:hidden"
        >
          <ul className="space-y-1 text-base font-medium">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl px-4 py-3 hover:bg-ink/5"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="mailto:falis.gabriel@gmail.com"
                className="mt-2 block rounded-xl bg-ink px-4 py-3 text-paper"
                onClick={() => setOpen(false)}
              >
                Let&apos;s talk
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}

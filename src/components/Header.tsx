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
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper px-4 sm:px-6">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between">
        <Link
          href="/"
          aria-label="Gabriel — home"
          className="group flex min-h-11 items-center gap-3 font-medium tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-ink text-sm font-bold text-paper">
            GF
          </span>
          <span>Gabriel</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {navigation.map((item) => {
              const active =
                item.href === '/#about'
                  ? pathname === '/'
                  : pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center border-b border-transparent px-4 text-sm transition-colors hover:border-ink/35 ${
                      active ? 'border-ink' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <Link
          href="mailto:falis.gabriel@gmail.com"
          className="button-primary hidden md:inline-flex"
        >
          Let&apos;s talk
        </Link>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex size-11 items-center justify-center border border-ink/12 md:hidden"
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
          className="absolute inset-x-0 top-full border-b border-ink/10 bg-paper p-4 md:hidden"
        >
          <ul className="space-y-1 text-base font-medium">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-12 items-center border-b border-ink/10 px-1"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="mailto:falis.gabriel@gmail.com"
                className="mt-3 flex min-h-12 items-center justify-center bg-ink px-4 text-paper"
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

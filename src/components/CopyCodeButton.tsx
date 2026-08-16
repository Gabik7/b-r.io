'use client'

import { useState } from 'react'
import { CheckIcon, Square2StackIcon } from '@heroicons/react/24/outline'

import { Button } from '@/components/Button'

type CopyCodeButtonProps = {
  text: string
  className?: string
  label?: string
}

export function CopyCodeButton({
  text,
  className,
  label = 'Copy code',
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false)
  const showCheck = copied

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <span className={className}>
      <Button
        type="button"
        variant="ghost"
        onClick={copy}
        aria-label={showCheck ? 'Copied' : label}
        className="size-9 p-0 text-muted-foreground"
      >
        <span className="relative block size-5 overflow-visible">
          <span
            className={`absolute inset-0 flex items-center justify-center transition duration-150 ${showCheck ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            aria-hidden={showCheck}
          >
            <Square2StackIcon className="size-5" strokeWidth={1.5} />
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition duration-150 ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            aria-hidden={!showCheck}
          >
            <CheckIcon className="size-5" strokeWidth={1.5} />
          </span>
        </span>
      </Button>
    </span>
  )
}

export const codeBlockSurfaceClass =
  'overflow-x-auto rounded-3xl border border-border bg-background text-[var(--tw-prose-pre-code)]'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

export const ogSize = {
  width: 1200,
  height: 630,
} as const

const titleMaxLength = 72

function formatOgTitle(title: string) {
  const trimmed = title.trim()
  if (trimmed.length <= titleMaxLength) return trimmed

  const slice = trimmed.slice(0, titleMaxLength)
  const lastSpace = slice.lastIndexOf(' ')
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : titleMaxLength).trimEnd()}…`
}

export async function generateOgImage({ title }: { title: string }) {
  const displayTitle = formatOgTitle(title)
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), 'src/fonts/CabinetGrotesk-Regular.woff2')),
    readFile(join(process.cwd(), 'src/fonts/CabinetGrotesk-Bold.woff2')),
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: '#f4f1e9',
        color: '#171714',
        fontFamily: 'Cabinet Grotesk',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: '#171714',
            color: '#f4f1e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          GF
        </div>
        <div style={{ fontSize: 30, color: '#585850' }}>Gabriel Falis</div>
      </div>
      <div
        style={{
          maxWidth: 1020,
          fontSize: 72,
          lineHeight: 0.98,
          letterSpacing: '-0.045em',
          fontWeight: 700,
        }}
      >
        {displayTitle}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <div
          style={{
            width: 90,
            height: 12,
            borderRadius: 99,
            background: '#3157d5',
          }}
        />
        <div
          style={{
            width: 48,
            height: 12,
            borderRadius: 99,
            background: '#f28d72',
          }}
        />
        <div
          style={{
            width: 28,
            height: 12,
            borderRadius: 99,
            background: '#c9e76a',
          }}
        />
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: 'Cabinet Grotesk', data: regular, weight: 400 },
        { name: 'Cabinet Grotesk', data: bold, weight: 700 },
      ],
    },
  )
}

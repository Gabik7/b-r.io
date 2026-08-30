import type { Metadata } from 'next'

import { InspectionForm } from './InspectionForm'

export const metadata: Metadata = {
  title: 'Samokontrola nehnuteľnosti — Odovzdaj',
  description: 'Bezpečný jednorazový formulár na kontrolu priestorov.',
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'no-referrer',
}

export default async function TenantInspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = '' } = await searchParams
  return <InspectionForm token={token} />
}

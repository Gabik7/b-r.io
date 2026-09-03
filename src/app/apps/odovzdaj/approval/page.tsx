import type { Metadata } from 'next'

import { ApprovalForm } from './ApprovalForm'

export const metadata: Metadata = {
  title: 'Potvrdenie protokolu — Odovzdaj',
  description: 'Bezpečné jednorazové potvrdenie odovzdávacieho protokolu.',
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'no-referrer',
}

export default function RemoteApprovalPage() {
  return <ApprovalForm />
}

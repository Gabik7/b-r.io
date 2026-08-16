import { permanentRedirect } from 'next/navigation'

export default function ThankYouPage() {
  permanentRedirect('/support')
}

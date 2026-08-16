import type { Metadata } from 'next'

import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for apps and services published by Gabriel Falis.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains how information is handled by mobile applications, websites, and related services published by Gabriel Falis that link to this page."
    >
      <section>
        <h2>1. Scope</h2>
        <p>
          This Privacy Policy applies to products published by Gabriel Falis
          that link to it. If an individual product provides an additional
          privacy notice, that notice supplements this policy and describes any
          product-specific data practices.
        </p>
      </section>

      <section>
        <h2>2. Information that may be processed</h2>
        <h3>Information you provide</h3>
        <p>
          When you contact support, I may receive your email address, the
          content of your message, attachments you choose to send, and technical
          details you include about the app or device.
        </p>
        <h3>App and device information</h3>
        <p>
          Depending on the features of a particular app, limited technical data
          such as app version, device type, operating-system version,
          diagnostics, or crash information may be processed to operate and
          improve the app. The App Store privacy information for each app
          describes the data used by that app and by any third-party SDKs
          included in it.
        </p>
        <h3>Purchases</h3>
        <p>
          App Store purchases are processed by Apple. I do not receive or store
          your full payment-card details. I may receive transaction status or a
          purchase identifier when needed to provide purchased functionality or
          support.
        </p>
      </section>

      <section>
        <h2>3. How information is used</h2>
        <ul>
          <li>
            To provide, maintain, secure, and improve the relevant product.
          </li>
          <li>To answer support requests and troubleshoot reported issues.</li>
          <li>To provide features you request and verify purchases.</li>
          <li>To comply with legal obligations and prevent misuse.</li>
        </ul>
        <p>
          Personal information is not sold. It is not used for cross-app
          tracking or targeted advertising unless an individual app clearly
          discloses that practice and obtains any consent required by law and
          Apple policy.
        </p>
      </section>

      <section>
        <h2>4. Sharing and service providers</h2>
        <p>
          Information may be processed by service providers only when necessary
          to deliver an app feature, host a service, process a purchase,
          diagnose a failure, or respond to support. These providers are
          expected to protect information consistently with this policy and
          applicable law. Apple independently processes information under its
          own privacy policy when you use the App Store, iCloud, StoreKit, or
          other Apple services.
        </p>
        <p>
          Information may also be disclosed where required by law, to protect
          users or the public, or in connection with a business transfer subject
          to appropriate safeguards.
        </p>
      </section>

      <section>
        <h2>5. Device permissions and consent</h2>
        <p>
          An app will request access to device features such as photos,
          notifications, camera, microphone, or location only when a feature
          needs that access. You can deny or revoke permissions in your device
          settings. Some features may not work without the relevant permission.
        </p>
      </section>

      <section>
        <h2>6. Retention and deletion</h2>
        <p>
          Information is retained only for as long as needed for the purpose for
          which it was processed, to meet legal obligations, or to resolve
          disputes. Support correspondence is generally deleted or anonymized
          when it is no longer reasonably needed. You may request deletion of
          personal information by emailing the address below. Some records may
          be retained where required by law or for legitimate security purposes.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          delete, restrict, or receive a copy of your personal information, and
          to object to or withdraw consent for certain processing. To make a
          request, email{' '}
          <a href="mailto:falis.gabriel@gmail.com?subject=Privacy%20request">
            falis.gabriel@gmail.com
          </a>
          . You may also have the right to contact your local data-protection
          authority.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          Products are not directed to children under 13 unless an individual
          app states otherwise and includes appropriate safeguards. If you
          believe a child has provided personal information, please contact me
          so it can be reviewed and deleted where appropriate.
        </p>
      </section>

      <section>
        <h2>9. Security and international processing</h2>
        <p>
          Reasonable technical and organizational measures are used to protect
          information. No system is completely secure. Service providers may
          process information in countries other than your own, with safeguards
          required by applicable law.
        </p>
      </section>

      <section>
        <h2>10. Changes and contact</h2>
        <p>
          This policy may be updated as products or legal requirements change.
          The effective date above will be revised when material updates are
          published.
        </p>
        <p>
          Questions or requests can be sent to Gabriel Falis at{' '}
          <a href="mailto:falis.gabriel@gmail.com">falis.gabriel@gmail.com</a>.
        </p>
      </section>
    </LegalPage>
  )
}

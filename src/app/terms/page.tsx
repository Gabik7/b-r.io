import type { Metadata } from 'next'

import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for apps and services published by Gabriel Falis.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms govern your use of apps, websites, and related services published by Gabriel Falis that link to this page."
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          By downloading, accessing, or using a product that links to these
          Terms, you agree to them. If you do not agree, do not use the product.
          Product-specific terms may supplement these Terms.
        </p>
      </section>

      <section>
        <h2>2. App Store license</h2>
        <p>
          Apps are licensed, not sold. Unless a custom end-user license
          agreement is provided for an app, use of an app downloaded from
          Apple&apos;s App Store is also subject to the{' '}
          <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
            Apple Standard Licensed Application End User License Agreement
          </a>
          . That agreement governs the App Store license to the extent
          applicable.
        </p>
      </section>

      <section>
        <h2>3. Permitted use</h2>
        <p>
          You receive a limited, personal, non-exclusive, non-transferable, and
          revocable right to use the product in accordance with these Terms and
          applicable platform rules. You may not misuse the product, interfere
          with its operation, attempt unauthorized access, infringe another
          person&apos;s rights, or reverse engineer it except where applicable
          law expressly permits that activity.
        </p>
      </section>

      <section>
        <h2>4. Your content and conduct</h2>
        <p>
          You remain responsible for content you create, store, or share through
          a product and for ensuring that you have the rights to use it. Do not
          use a product for unlawful, harmful, fraudulent, abusive, or
          infringing activity.
        </p>
      </section>

      <section>
        <h2>5. Purchases and subscriptions</h2>
        <p>
          Prices, billing periods, trials, and renewal terms are shown before
          purchase. App Store transactions are processed by Apple and are
          subject to Apple&apos;s payment and refund rules. You can manage or
          cancel a subscription through your Apple account settings. Except
          where law requires otherwise, access already provided is not
          refundable by me.
        </p>
      </section>

      <section>
        <h2>6. Third-party services</h2>
        <p>
          A product may link to or rely on third-party services. Their
          availability, content, and practices are controlled by their providers
          and may be subject to separate terms. I am not responsible for a
          third-party service beyond what applicable law requires.
        </p>
      </section>

      <section>
        <h2>7. Ownership</h2>
        <p>
          The products, including their software, design, branding, and original
          content, are owned by Gabriel Falis or relevant licensors and are
          protected by intellectual-property law. No rights are granted except
          the limited right to use the product described in these Terms.
        </p>
      </section>

      <section>
        <h2>8. Availability and changes</h2>
        <p>
          Products may be updated, changed, suspended, or discontinued. Features
          may vary by device, platform, region, or version. Reasonable efforts
          are made to keep products reliable, but uninterrupted availability is
          not guaranteed.
        </p>
      </section>

      <section>
        <h2>9. Disclaimer</h2>
        <p>
          To the maximum extent permitted by law, products are provided “as is”
          and “as available,” without warranties beyond those that cannot
          legally be excluded. Products are not a substitute for professional
          medical, legal, financial, or other regulated advice unless an
          individual product expressly states otherwise.
        </p>
      </section>

      <section>
        <h2>10. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Gabriel Falis will not be
          liable for indirect, incidental, special, consequential, or punitive
          loss, or for loss of data, profits, or business arising from use of a
          product. Nothing in these Terms limits liability or consumer rights
          that cannot be limited under applicable law.
        </p>
      </section>

      <section>
        <h2>11. Termination</h2>
        <p>
          Your permission to use a product may end if you materially violate
          these Terms. You may stop using a product at any time. Provisions that
          by their nature should survive termination, including ownership,
          disclaimers, and limitations of liability, will remain in effect.
        </p>
      </section>

      <section>
        <h2>12. Governing law</h2>
        <p>
          These Terms are governed by the laws of the Slovak Republic, without
          excluding mandatory protections available to consumers under the law
          of their country of residence. Courts with jurisdiction under
          applicable law may hear disputes.
        </p>
      </section>

      <section>
        <h2>13. Changes and contact</h2>
        <p>
          These Terms may be updated as products or legal requirements change.
          Continued use after an update means you accept the revised Terms where
          permitted by law.
        </p>
        <p>
          Questions can be sent to Gabriel Falis at{' '}
          <a href="mailto:falis.gabriel@gmail.com">falis.gabriel@gmail.com</a>.
        </p>
      </section>
    </LegalPage>
  )
}

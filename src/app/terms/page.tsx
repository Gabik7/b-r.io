import type { Metadata } from 'next'

import { LegalPage } from '@/components/LegalPage'
import { createPageMetadata } from '@/lib/metadata'

const title = 'Terms of Service for ENSELORA & Gabriel Falis Apps'
const description =
  'General terms for apps by Gabriel Falis, with ENSELORA-specific terms for subscriptions, AI outfit suggestions, virtual Try-On, accounts, and acceptable use.'

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/terms',
  heroTitle: 'Terms for ENSELORA and apps by Gabriel Falis.',
})

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="One set of general terms for apps and related services published by Gabriel Falis, followed by product-specific terms for ENSELORA."
    >
      <section>
        <h2>1. Agreement and scope</h2>
        <p>
          These Terms apply when you download, access, purchase, or use a mobile
          app, website, or related service published by Gabriel Falis that links
          to this page. By using a covered product, you agree to these Terms. If
          you do not agree, do not use the product.
        </p>
        <p>
          Product-specific terms form part of this agreement. If they conflict
          with the general terms, the product-specific terms control for that
          product. ServiceBook maintains its own product website and may provide
          separate terms.
        </p>
      </section>

      <section>
        <h2>2. App Store licence</h2>
        <p>
          Apps are licensed, not sold. You receive a limited, personal,
          non-exclusive, non-transferable, and revocable right to use a covered
          app on Apple-branded devices you own or control, subject to these
          Terms and applicable App Store rules.
        </p>
        <p>
          Unless a custom end-user licence agreement is presented for an app,
          the{' '}
          <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
            Apple Standard Licensed Application End User License Agreement
          </a>{' '}
          also applies to an app obtained through the App Store. Apple is not
          responsible for providing product support beyond obligations that
          cannot be excluded by law.
        </p>
      </section>

      <section>
        <h2>3. Accounts and your content</h2>
        <p>
          Some features may work without an account; others may offer optional
          Sign in with Apple or cloud sync. You are responsible for maintaining
          access to your Apple account and device. You remain responsible for
          photos and other content you add and must have the rights and
          permissions necessary to use that content.
        </p>
        <p>
          You retain ownership of your content. You grant the limited permission
          needed to process it only for features you request, such as sync,
          image analysis, background removal, or generation of a visual preview.
          Data practices are described in the Privacy Policy.
        </p>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>You must not:</p>
        <ul>
          <li>
            use a product for unlawful, harmful, fraudulent, or abusive
            activity;
          </li>
          <li>upload content that infringes another person&apos;s rights;</li>
          <li>bypass limits, subscriptions, security, or access controls;</li>
          <li>interfere with the product or attempt unauthorised access; or</li>
          <li>
            copy, resell, or reverse engineer the product except where
            applicable law expressly permits it.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Purchases and subscriptions</h2>
        <p>
          Prices, billing periods, trial eligibility, included features, and
          renewal terms are displayed before purchase. App Store transactions
          are processed by Apple and are subject to Apple&apos;s payment,
          refund, and subscription rules. Gabriel Falis cannot directly issue an
          App Store refund or change your Apple billing information.
        </p>
        <p>
          An auto-renewable subscription is charged to your Apple Account at
          confirmation and renews unless cancelled at least 24 hours before the
          end of the current period. Apple may charge the renewal within 24
          hours before that period ends. You can manage or cancel a subscription
          in iOS Settings → Apple Account → Subscriptions. Deleting an app does
          not cancel a subscription.
        </p>
      </section>

      <section id="enselora" className="scroll-mt-24">
        <h2>6. ENSELORA-specific terms</h2>
        <h3>The service</h3>
        <p>
          ENSELORA provides digital wardrobe organisation, outfit planning,
          wardrobe insights, and optional AI-assisted features. Suggestions are
          guidance, not a guarantee. Results depend on the information, photos,
          clothes, context, and external services available.
        </p>

        <h3>Free version and ENSELORA+</h3>
        <p>
          The free version may limit wardrobe items, daily recommendations,
          saved outfits, or other resource-intensive features. Current limits
          are shown in the app before they are reached.
        </p>
        <p>
          ENSELORA+ is an auto-renewable monthly or annual subscription
          purchased through the App Store. It may include expanded wardrobe and
          planning features, a daily AI-generation allowance, a monthly virtual
          Try-On allowance, advanced insights, editing tools, and optional cloud
          sync. The exact features, limits, price, billing period, and any
          introductory offer are shown in the app before purchase.
        </p>

        <h3>AI suggestions and virtual Try-On</h3>
        <p>
          Automated clothing descriptions and outfit suggestions may be
          incomplete or incorrect. Check a recommendation against weather, dress
          requirements, comfort, safety, and your own judgement.
        </p>
        <p>
          Virtual Try-On creates an illustrative preview. It does not guarantee
          exact fit, sizing, body shape, fabric, colour, construction, or how an
          item will look in person. Do not rely on it as a sizing or purchasing
          guarantee.
        </p>

        <h3>Accounts, sync, and deletion</h3>
        <p>
          ENSELORA works locally without a required account. Optional cloud sync
          requires Sign in with Apple, an eligible ENSELORA+ entitlement, and
          available cloud services. Sync is intended to keep supported wardrobe
          data available across supported devices, but a current local backup or
          export remains advisable for important information.
        </p>
        <p>
          You can delete local data separately from an optional cloud account.
          Account deletion cannot be undone after cloud records and files have
          been removed. Cancelling a subscription and deleting an account are
          separate actions.
        </p>
      </section>

      <section>
        <h2>7. Third-party services</h2>
        <p>
          A covered product may depend on Apple services and other providers for
          hosting, accounts, purchases, cloud storage, AI processing, weather,
          analytics, diagnostics, or support. Their services may be subject to
          separate terms and may occasionally be unavailable. Gabriel Falis is
          not responsible for a third-party service beyond what applicable law
          requires.
        </p>
      </section>

      <section>
        <h2>8. Availability and product changes</h2>
        <p>
          Products may be updated, changed, suspended, or discontinued. Features
          can vary by device, operating-system version, language, region,
          subscription, or third-party availability. Reasonable efforts are made
          to keep paid functionality useful and to communicate material changes,
          but uninterrupted operation is not guaranteed.
        </p>
      </section>

      <section>
        <h2>9. Ownership and feedback</h2>
        <p>
          The products, including software, design, branding, and original
          content, are owned by Gabriel Falis or relevant licensors and
          protected by intellectual-property law. No rights are granted except
          the limited licence described in these Terms.
        </p>
        <p>
          If you voluntarily provide an idea or feedback, it may be used to
          improve the product without an obligation to compensate you, while
          your personal information remains governed by the Privacy Policy.
        </p>
      </section>

      <section>
        <h2>10. Disclaimer and liability</h2>
        <p>
          To the maximum extent permitted by law, covered products are provided
          “as is” and “as available,” without warranties beyond those that
          cannot legally be excluded. They are not a substitute for professional
          medical, health, legal, financial, or other regulated advice.
        </p>
        <p>
          To the maximum extent permitted by law, Gabriel Falis is not liable
          for indirect, incidental, special, consequential, or punitive loss, or
          for loss of data, profit, or business arising from use of a product.
          Nothing in these Terms excludes mandatory consumer rights or liability
          that cannot legally be limited.
        </p>
      </section>

      <section>
        <h2>11. Suspension and termination</h2>
        <p>
          Access may be suspended or ended if you materially violate these
          Terms, threaten the security of a product, or misuse a service. You
          may stop using a product at any time. Provisions that should
          reasonably survive, including ownership, disclaimers, and liability
          limits, remain in effect.
        </p>
      </section>

      <section>
        <h2>12. Governing law and contact</h2>
        <p>
          These Terms are governed by the laws of the Slovak Republic, without
          removing mandatory protections available to consumers under the law of
          their country of residence. Courts with jurisdiction under applicable
          law may hear disputes.
        </p>
        <p>
          Questions can be sent to Gabriel Falis, Slovakia, at{' '}
          <a href="mailto:falis.gabriel@gmail.com">falis.gabriel@gmail.com</a>.
          These Terms may be updated when products or legal requirements change;
          the effective date will be revised and material changes communicated
          where appropriate.
        </p>
      </section>
    </LegalPage>
  )
}

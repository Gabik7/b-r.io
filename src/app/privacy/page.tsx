import type { Metadata } from 'next'

import { LegalPage } from '@/components/LegalPage'
import { createPageMetadata } from '@/lib/metadata'

const title = 'Privacy Policy for ENSELORA & Gabriel Falis Apps'
const description =
  'Privacy policy for ENSELORA and other apps by Gabriel Falis, covering local data, photos, optional AI, cloud sync, subscriptions, analytics, and deletion.'

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/privacy',
  heroTitle: 'Privacy for ENSELORA and apps by Gabriel Falis.',
})

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="One policy for apps and related services published by Gabriel Falis. Product-specific details below explain how ENSELORA works without requiring a separate legal website or domain."
    >
      <section>
        <h2>1. Scope and covered products</h2>
        <p>
          This Privacy Policy applies to mobile apps, websites, support
          channels, and related services published by Gabriel Falis that link to
          this page. It currently provides product-specific disclosures for
          ENSELORA. New products may be added here before they launch.
        </p>
        <p>
          ServiceBook maintains its own product website and privacy information.
          Where an app-specific section conflicts with the general part of this
          policy, the more specific disclosure applies to that app.
        </p>
      </section>

      <section>
        <h2>2. Data controller and contact</h2>
        <p>
          The controller for products covered by this policy is Gabriel Falis,
          Slovakia. Privacy questions and requests can be sent to{' '}
          <a href="mailto:falis.gabriel@gmail.com?subject=Privacy%20request">
            falis.gabriel@gmail.com
          </a>
          .
        </p>
        <p>
          When making a request, include the app name and enough information to
          identify the relevant account or support conversation. Do not send a
          password or full payment-card information.
        </p>
      </section>

      <section>
        <h2>3. General data practices</h2>
        <h3>Information you provide</h3>
        <p>
          Depending on the product, this may include account information,
          content you create or upload, preferences, feedback, and support
          messages. Each app should request only the information required for a
          feature you choose to use.
        </p>
        <h3>Technical and purchase information</h3>
        <p>
          A product may process app version, device and operating-system
          details, request identifiers, subscription status, diagnostics, or
          security events needed to operate, protect, and troubleshoot the
          service. Apple processes App Store payments; Gabriel Falis does not
          receive full payment-card details.
        </p>
        <h3>Purposes and legal bases</h3>
        <p>
          Information is used to provide requested features and purchases,
          maintain security, answer support, comply with legal obligations, and
          improve a product where consent or another applicable legal basis
          permits it. Personal information is not sold and is not used for
          cross-app advertising tracking.
        </p>
      </section>

      <section id="enselora" className="scroll-mt-24">
        <h2>4. ENSELORA privacy details</h2>
        <h3>Data processed by ENSELORA</h3>
        <p>Depending on the features you use, ENSELORA may process:</p>
        <ul>
          <li>
            profile preferences such as name, style, occasions, and reminder
            time;
          </li>
          <li>
            clothing photos, originals, local previews, masks, and wardrobe-item
            descriptions;
          </li>
          <li>
            saved outfits, wear history, travel plans, favourites, and feedback;
          </li>
          <li>
            for an optional account, an internal identifier and the email
            address hidden or provided through Sign in with Apple;
          </li>
          <li>
            approximate location after optional permission, used for local
            weather through Apple WeatherKit;
          </li>
          <li>
            optionally selected calendar event titles, processed on device to
            infer the type of activity and not stored by ENSELORA;
          </li>
          <li>
            technical subscription, quota, security, analytics, or crash data as
            described below; and
          </li>
          <li>information you choose to send to support.</li>
        </ul>

        <h3>Local data, optional account, and cloud sync</h3>
        <p>
          Without signing in, the wardrobe, profile, photos, outfits, and
          history remain stored locally in the iPhone app. Try-On history,
          including the person photo and result, remains local unless an
          eligible user separately enables Try-On sync.
        </p>
        <p>
          Optional Sign in with Apple creates an account through Supabase Auth.
          If an eligible ENSELORA+ user enables sync, profile, wardrobe, outfit,
          wear-history, shopping-list and travel-plan records, plus clothing
          photos, are stored in a private Supabase database and storage bucket.
          If Try-On sync is explicitly enabled, its source and result photos are
          stored in a separate private bucket. Access rules
          restrict an account to its own records and files. Changes are saved
          locally before transfer over HTTPS.
        </p>

        <h3>AI and image processing</h3>
        <p>
          Basic foreground separation may run on the iPhone through Apple
          Vision. If you choose remote clothing recognition, fallback background
          removal, multi-item or video-frame wardrobe scanning, outfit
          generation, or virtual Try-On, the information
          required for that request is sent through the ENSELORA service after
          the relevant consent. Google Gemini may process clothing recognition
          and outfit composition. Replicate may process fallback background
          removal through 851 Labs and virtual Try-On through configured model
          providers. A higher-quality Try-On request may compare approved model
          outputs and use Gemini to select the strongest preservation result.
          Try-On may include a full-body photo and photos of selected clothes.
        </p>
        <p>
          Submitted photos are not used by Gabriel Falis for advertising or to
          train a proprietary model. ENSELORA does not create a permanent server
          photo archive or intentionally log photo content. Technical request
          caches expire within 15 minutes. Pseudonymous daily or monthly quota
          counters expire within 32 days. External providers process requests
          under their own terms, retention rules, and data-processing
          safeguards.
        </p>

        <h3>Weather, location, and calendar</h3>
        <p>
          Location is optional. If allowed, approximate location is used with
          Apple WeatherKit to retrieve local weather. A destination entered for
          a travel plan may be geocoded and queried through WeatherKit without
          requesting the device location. Coordinates and forecast details may
          be retained with that travel plan and included in optional cloud sync.
          Weather responses are also kept in a time-limited device cache.
          Location is not used for advertising or cross-app tracking. Optional
          calendar event titles are processed on device and are not stored by
          ENSELORA.
        </p>

        <h3>Subscriptions</h3>
        <p>
          Apple processes purchases through the App Store. RevenueCat helps
          verify subscription status and consumable Try-On credits and may
          process a pseudonymous app-user identifier, product, transaction,
          webhook event, credit-ledger entry, and entitlement information.
          ENSELORA does not receive the full payment-card number.
        </p>

        <h3>Optional analytics and diagnostics</h3>
        <p>
          PostHog product analytics and Sentry crash diagnostics are separate,
          off-by-default choices. After consent, ENSELORA sends only predefined
          feature events or technical diagnostics needed to understand use and
          investigate failures. It does not send wardrobe photos, clothing
          names, outfit text, or the account email. Session replay, automatic
          screen capture, and cross-app tracking are not used. Consent can be
          withdrawn in the app under Account &amp; Sync.
        </p>
        <p>
          The server records pseudonymous AI operation, model, token or unit
          count, estimated cost, request identifier, and timestamp for quota,
          abuse prevention, cost monitoring, and operations. It does not store
          the submitted image or generated image in those cost records. App
          Attest may store a device-generated public key, receipt, assertion
          counter, and last-use time to verify genuine app requests.
        </p>
      </section>

      <section>
        <h2>5. Service providers and transfers</h2>
        <p>
          Depending on the selected ENSELORA feature, service providers may
          include Apple, Supabase, Google Gemini, Replicate and its named model
          providers, RevenueCat, PostHog, Sentry, and the infrastructure provider
          hosting the self-managed GFCodes web, API, and private Redis service.
          They process information only for the relevant hosting, account,
          purchase, AI, rate-limiting, analytics, diagnostics, or support purpose.
        </p>
        <p>
          Providers may process information outside the European Economic Area.
          Where required, transfers rely on an adequacy decision, Standard
          Contractual Clauses, or another lawful safeguard. Apple independently
          processes information under its own privacy policy when you use the
          App Store, Sign in with Apple, WeatherKit, or other Apple services.
        </p>
      </section>

      <section>
        <h2>6. Retention and deletion</h2>
        <p>
          Local app information remains until you delete it in the app, remove
          the app, or erase the device, subject to device backups you control.
          Optional cloud data remains while the account is active and is removed
          when the in-app cloud-account deletion completes, except for records
          that must be retained for security, fraud prevention, or legal
          compliance.
        </p>
        <p>
          ENSELORA support correspondence is retained for no longer than 12
          months unless a longer period is reasonably needed to resolve the
          request or required by law. Temporary AI request and quota records use
          the shorter periods stated in the ENSELORA section above.
        </p>
      </section>

      <section>
        <h2>7. Your controls and rights</h2>
        <p>
          ENSELORA provides controls to export app data, delete local data,
          withdraw optional analytics or diagnostics consent, sign out, and
          delete an optional cloud account. Deleting the cloud account removes
          its cloud records and cloud clothing photos; local data can be deleted
          separately.
        </p>
        <p>
          Depending on applicable law, you may request access, correction,
          deletion, restriction, portability, or object to processing. You may
          withdraw consent at any time without affecting processing that was
          lawful before withdrawal. You may also complain to your local data
          protection authority, including the Office for Personal Data
          Protection of the Slovak Republic where applicable.
        </p>
      </section>

      <section>
        <h2>8. Children, security, and changes</h2>
        <p>
          Covered products are not directed to children under 13 unless an
          individual product says otherwise and provides appropriate safeguards.
          Reasonable technical and organisational measures are used to protect
          information, but no system can guarantee absolute security.
        </p>
        <p>
          This policy may be updated when products, providers, or legal
          requirements change. The effective date will be revised, and material
          changes will be communicated in the app where appropriate.
        </p>
      </section>
    </LegalPage>
  )
}

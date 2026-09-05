# ENSELORA 1.2.2 API preparation — 2026-09-05

Production deployment has not been performed.

- RevenueCat canonical and legacy entitlements are evaluated independently; subscription billing grace periods retain access. Malformed/upstream failures return a visible error instead of a free quota. Negative results are not cached, so a purchase can unlock on the next verification. Webhook/audit force fresh verification and update the local cache.
- Lua admission atomically checks and increments the existing daily/monthly quota. A unique TTL reservation marker makes compensation idempotent and prevents negative or recreated expired counters. Existing counter keys and limits are preserved; no Redis reset or data migration is required.
- Try-On replay returns current included balance without charging another purchased credit. Active request leases cover the bounded primary/fallback workflow.
- Server outfit validation rejects incompatible complete bases, unknown categories, duplicate roles and learned avoided pairings before caching a successful result. Invalid results follow the existing refund path.

Validation: 43/43 Bun tests, including real concurrent Redis reservations on a disposable loopback instance; Astro check (0 errors/warnings) and production build passed. RevenueCat HTTP responses are mocked. No purchases, paid models or user images were sent. Existing Supabase purchased-credit ledger uses transactional per-user locking and unique debit/refund references; a live SQL purchase/restore cycle was not exercised. Credit sales remain disabled in the iOS application.

To reproduce concurrency checks, start an empty Redis bound only to 127.0.0.1 (no persistence), then run in services/api:

```sh
ENSELORA_QUOTA_TEST_URL=redis://127.0.0.1:16479 bun test
npm run build
```

Never point this suite at a shared or production Redis. Let in-flight provider requests finish before restarting API workers for deployment. Afterwards check health, unauthenticated rejection and an explicitly authorized sandbox purchase/restore/generation path. Health alone does not verify payment activation. The iOS release report documents remaining production checks.

## Deployment requirements

This patch introduces no new environment variables, database migrations, RLS changes, product IDs or pricing changes. Keep the existing Redis counters and data; do not flush Redis. The iOS 1.2.2 (35) archive remains valid.

1. Push the backend commit and deploy/rebuild the API using the existing VPS/Ploi workflow. A local Git commit alone does not update production. Drain in-flight AI requests before restarting workers.
2. Supabase `refresh-entitlement` **v6 was deployed on 2026-09-05 after explicit user approval**. It is ACTIVE with JWT verification enabled. Both deployed files match the tested source; an unauthenticated POST returns HTTP 401. The subscription grace-period fix is live; no further Supabase deployment or schema migration is needed for this patch.
3. Before public release, verify an authorized App Store sandbox purchase, premium activation, restore and access on a second device. Paid AI/Try-On requires separate explicit authorization for the test. Credit-pack sales remain disabled until their delivery/refund flow is exercised.

Existing App Store Connect/RevenueCat dashboard configuration was not changed by this patch. Health and mocked tests do not substitute for the purchase-to-feature-access verification.

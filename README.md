# GFCodes platform

Osobné portfólio Gabriela Falisa, spoločné právne a support stránky pre aplikácie
a centrálna API vrstva. Verejný web beží na `gfcodes.com`, API na
`api.gfcodes.com`. Každá aplikácia má vlastný menný priestor, serverové secrets,
kvóty a samostatný Supabase projekt.

## Obsah repozitára

| Cesta | Úloha |
| --- | --- |
| `src/` | Next.js portfólio, projekty, support, Privacy Policy a Terms |
| `services/api/` | Astro/Node API pre mobilné aplikácie |
| `services/api/src/apps/enselora/` | ENSELORA validácia, autentifikácia a AI orchestration |
| `services/api/src/pages/v1/enselora/` | Verejné ENSELORA API endpointy |
| `infra/Caddyfile` | HTTPS terminácia a reverse proxy |
| `docker-compose.yml` | web, API, Redis a Caddy pre jeden VPS |
| `VPS_DEPLOYMENT.md` | kompletný produkčný postup |

## Architektúra

- Next.js 16 standalone kontajner obsluhuje portfólio a spoločné legal/support URL.
- Astro 7 s Node adapterom obsluhuje verzované API.
- Caddy automaticky vystaví a obnovuje TLS certifikáty.
- Redis je dostupný iba na internej Docker sieti a drží rate limit, idempotenciu a
  nákladové kvóty. Nie je verejne vystavený.
- ENSELORA používa vlastný Supabase projekt. Ďalšia aplikácia má mať nový projekt,
  vlastný prefix premenných a vlastný API namespace.
- Gemini, Replicate, RevenueCat a Supabase secret keys zostávajú iba na serveri.
- ENSELORA API zahŕňa serverový App Attest verifier, RevenueCat webhook audit,
  kreditný ledger a pseudonymné cost udalosti/alerty. Aktivácia je krokovaná v
  `VPS_DEPLOYMENT.md`.

## Lokálny vývoj

Web:

```sh
npm install
npm run dev
```

API (vyžaduje lokálny Redis a premenné podľa `services/api/.env.example`):

```sh
cd services/api
bun install
bun run dev
```

Kontroly:

```sh
npm run check
cd services/api
bun test
bun run build
```

## Verejné adresy

- Portfólio: `https://gfcodes.com`
- ENSELORA: `https://gfcodes.com/apps/enselora`
- Privacy: `https://gfcodes.com/privacy#enselora`
- Terms: `https://gfcodes.com/terms#enselora`
- Support: `https://gfcodes.com/support#enselora`
- API health: `https://api.gfcodes.com/health`
- ENSELORA API: `https://api.gfcodes.com/v1/enselora`

Právny text musí byť pred vydaním skontrolovaný podľa reálnych dátových tokov a
App Store privacy odpovede sa s ním musia zhodovať. Produkčné nasadenie a postup
pridania ďalšej aplikácie sú v `VPS_DEPLOYMENT.md`.

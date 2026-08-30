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
| `services/api/src/apps/setlyvo/` | Bezpečná brána na interný Setlyvo Laravel service |
| `services/api/src/pages/v1/setlyvo/` | Verejný Setlyvo API namespace |
| `docker-compose.yml` | web, API, Redis a voliteľný Caddy pre samostatný VPS |
| `docker-compose.ploi.yml` | Ploi override: vypne Caddy a vystaví iba lokálne proxy porty |
| `infra/Caddyfile` | alternatívny proxy mimo Ploi; v Ploi produkcii sa nepoužíva |
| `VPS_DEPLOYMENT.md` | kompletný postup pre Hetzner + Ploi + Namecheap |

## Architektúra

- Next.js 16 standalone kontajner obsluhuje portfólio a spoločné legal/support URL.
- Astro 7 s Node adapterom obsluhuje verzované API.
- V produkcii Ploi/Nginx terminujú HTTPS a Ploi obnovuje Let's Encrypt
  certifikáty. Caddy zostáva iba ako alternatíva pre server bez Ploi.
- Redis je dostupný iba na internej Docker sieti a drží per-user/globálne/IP rate
  limity, provider concurrency, idempotenciu a atómový denný cost breaker. Nie je
  verejne vystavený.
- ENSELORA používa vlastný Supabase projekt. Ďalšia aplikácia má mať nový projekt,
  vlastný prefix premenných a vlastný API namespace.
- Setlyvo používa vlastný Laravel/PostgreSQL service. Astro vrstva sprístupňuje
  namespace `/v1/setlyvo`, filtruje hlavičky a preposiela požiadavky na privátny
  `SETLYVO_API_UPSTREAM_URL`; Laravel zostáva kanonický pre auth a dáta.
- Gemini, Replicate, RevenueCat a Supabase secret keys zostávajú iba na serveri.
- ENSELORA API zahŕňa serverový App Attest verifier, RevenueCat webhook audit,
  kreditný ledger, pseudonymné cost udalosti/alerty, obmedzené admin endpointy a
  allowlist domén pre provider obrázky. Aktivácia je krokovaná v
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
- Setlyvo API: `https://api.gfcodes.com/v1/setlyvo`
- Odovzdaj: `https://gfcodes.com/apps/odovzdaj`
- Odovzdaj Privacy: `https://gfcodes.com/privacy#odovzdaj`
- Odovzdaj Terms: `https://gfcodes.com/terms#odovzdaj`
- Odovzdaj Support: `https://gfcodes.com/support#odovzdaj`

Právny text musí byť pred vydaním skontrolovaný podľa reálnych dátových tokov a
App Store privacy odpovede sa s ním musia zhodovať. Produkčné nasadenie na Hetzner
cez Ploi, Namecheap DNS, SSL, aktualizácie, rollback aj postup pridania ďalšej
aplikácie sú v `VPS_DEPLOYMENT.md`.

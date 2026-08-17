# GFCodes — nasadenie webu a API na VPS

Toto je jediný prevádzkový postup pre centrálny web a API. ENSELORA repozitár
obsahuje iba iOS klienta a svoj Supabase backend; serverové nasadenie sa spravuje
tu.

## 1. Predpoklady

- Ubuntu VPS s verejnou IPv4 (voliteľne IPv6), aspoň 2 GB RAM a pravidelnými
  bezpečnostnými aktualizáciami.
- Docker Engine s Compose pluginom a Git.
- DNS `A` záznamy `gfcodes.com` a `api.gfcodes.com` smerujúce na VPS. Pri IPv6 aj
  správne `AAAA` záznamy.
- Firewall povoľuje iba SSH, TCP 80, TCP 443 a UDP 443. Porty 3000, 4321 a 6379
  nesmú byť verejne otvorené.

## 2. Prvý deploy

```sh
git clone https://github.com/Gabik7/b-r.io.git /opt/gfcodes
cd /opt/gfcodes
cp .env.vps.example .env.vps
chmod 600 .env.vps
```

V `.env.vps` nastav produkčné domény, ACME e-mail, dlhé náhodné Redis heslo a
ENSELORA provider secrets. Bezpečné heslo môžeš vytvoriť príkazom:

```sh
openssl rand -base64 48
```

Supabase publishable key nie je tajný, ale každý provider secret musí zostať iba
v `.env.vps`. Súbor nikdy necommituj.

Pred spustením skontroluj výslednú konfiguráciu a postav kontajnery:

```sh
docker compose --env-file .env.vps config
docker compose --env-file .env.vps build
docker compose --env-file .env.vps up -d
docker compose --env-file .env.vps ps
```

Caddy po správnom DNS automaticky vybaví HTTPS. Stav over:

```sh
curl --fail https://gfcodes.com/api/health
curl --fail https://api.gfcodes.com/health
```

API health musí vrátiť `ok: true` aj pre Redis. Ak API kontajner nenabehne,
validátor pri štarte vypíše presný chýbajúci alebo neplatný environment key.

## 3. ENSELORA serverové nastavenia

Povinné premenné sú zdokumentované v `.env.vps.example` a majú prefix
`ENSELORA_`. Produkčný API kontrakt je:

| Metóda | Endpoint |
| --- | --- |
| `POST` | `/v1/enselora/garments/analyze` |
| `POST` | `/v1/enselora/garments/detect` |
| `POST` | `/v1/enselora/outfits/recommend` |
| `POST` | `/v1/enselora/images/remove-background` |
| `POST` | `/v1/enselora/try-on` |
| `GET` | `/v1/enselora/credits` |
| `POST` | `/v1/enselora/app-attest/challenge` |
| `POST` | `/v1/enselora/app-attest/register` |
| `POST` | `/v1/enselora/webhooks/revenuecat` |
| `GET` | `/v1/enselora/admin/costs?days=30` |
| `POST` | `/v1/enselora/admin/entitlements/audit` |

Každá požiadavka musí poslať `X-ENSELORA-Client: ios`, installation ID a platný
Supabase bearer JWT. API nemá kompatibilný anonymný bypass. ENSELORA má vlastný
Supabase projekt; databázy rôznych aplikácií sa nemajú zdieľať.

### Povinné poradie aktivácie

1. V ENSELORA repozitári spusti `supabase db push`. Nová migrácia vytvorí
   App Attest kľúče, RevenueCat audit udalostí, serverový kreditný ledger,
   AI cost udalosti a private `tryon-images` bucket.
2. Na VPS nastav `ENSELORA_SUPABASE_SECRET_KEY` na nový `sb_secret_...` serverový
   kľúč. Nikdy ho nevkladaj do iOS klienta ani verejného Next.js kontajnera.
3. V RevenueCat nastav webhook URL
   `https://api.gfcodes.com/v1/enselora/webhooks/revenuecat`, vlastný Authorization
   header aj HMAC signing secret. Rovnaké hodnoty vlož do VPS env. Pošli test event
   a over riadok `processed_at` v `revenuecat_webhook_events`.
4. V App Store Connect vytvor consumable produkt
   `com.gabriel.enselora.tryon.credits10`; v RevenueCat ho namapuj na 10 kreditov.
   Klientsky flag zapni až po úspešnom sandbox nákupe, webhooku a kontrole ledgeru.
5. Doplň aktuálne provider ceny do cost premenných. `0` znamená neznámy odhad,
   nie bezplatné volanie. Nastav denný limit a HTTPS alert webhook.
6. App Attest najprv nechaj `off`. Po fyzickom TestFlight teste prepnúť na
   `observe`, skontrolovať registrácie a monotónne counters, až potom `enforce`.
   iOS flag sa zapína až súčasne s pripraveným serverom.

Admin endpointy vyžadujú header `Authorization: Bearer <ENSELORA_ADMIN_API_KEY>` a
nesmú byť volané z aplikácie. Cost sumár používa serverové odhady v millionths of
EUR; provider billing dashboard zostáva konečným zdrojom fakturovanej sumy.

Try-On režim `best` porovná dva modely iba vtedy, keď je nastavený sekundárny model
a `ENSELORA_TRYON_COMPARE_ENABLED=true`. Najprv over cenu, latenciu, kvalitu a
licenciu konkrétneho modelu. Try-On je vizuálny náhľad, nie meranie veľkosti.

## 4. Aktualizácia a rollback

Pred každým deployom vytvor snapshot VPS alebo zálohu trvalých volume. Potom:

```sh
cd /opt/gfcodes
git pull --ff-only
docker compose --env-file .env.vps build
docker compose --env-file .env.vps up -d
docker compose --env-file .env.vps ps
```

Logy:

```sh
docker compose --env-file .env.vps logs --tail=200 site api caddy redis
```

Rollback rob návratom na posledný overený Git commit a opätovným buildom. Redis
volume nemaž; obsahuje kvóty a idempotency záznamy. Caddy volume obsahuje TLS stav.

## 5. Zálohy a údržba

- Denne zálohuj `redis_data` alebo celý VPS snapshot. Redis používa AOF s
  `appendfsync everysec`.
- Supabase databázu a Storage zálohuj v príslušnom projekte nezávisle od VPS.
- Sleduj voľné miesto, RAM, kontajnerové restarty a neúspešné healthchecky.
- Pravidelne obnov Docker image a OS security aktualizácie.
- Rotuj provider secrets po incidente a okamžite znovu nasaď API.
- Logy nesmú obsahovať fotografie, base64 payloady, auth tokeny ani osobné prompty.

## 6. Pridanie ďalšej aplikácie

1. Vytvor `services/api/src/apps/<app>/` pre jej validáciu a provider logiku.
2. Endpointy vlož pod `services/api/src/pages/v1/<app>/`.
3. Použi vlastný header, Redis key prefix, kvóty a environment prefix.
4. Vytvor samostatný Supabase projekt, RLS, Storage a auth nastavenia.
5. Secrets pridaj do `.env.vps.example`, `docker-compose.yml` a runtime validátora.
6. Do spoločných Privacy, Terms a Support stránok pridaj jednoznačnú sekciu appky.
7. Pridaj API testy a over celý `docker compose` pred produkčným rolloutom.

Tým zostáva doména a VPS spoločný, ale dáta, autorizácia, limity a prípadný incident
jednej aplikácie sú logicky oddelené od ostatných.

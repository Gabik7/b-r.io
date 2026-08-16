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
| `POST` | `/v1/enselora/outfits/recommend` |
| `POST` | `/v1/enselora/images/remove-background` |
| `POST` | `/v1/enselora/try-on` |

Každá požiadavka musí poslať `X-ENSELORA-Client: ios`, installation ID a platný
Supabase bearer JWT. API nemá kompatibilný anonymný bypass. ENSELORA má vlastný
Supabase projekt; databázy rôznych aplikácií sa nemajú zdieľať.

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

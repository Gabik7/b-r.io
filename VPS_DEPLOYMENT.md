# GFCodes — Hetzner + Ploi + Namecheap

Toto je hlavný produkčný postup pre `gfcodes.com` a `api.gfcodes.com`. Web aj API
bežia v Docker kontajneroch na jednom Hetzner VPS. Ploi spravuje verejný proxy,
Nginx a Let's Encrypt. Caddy sa pri tomto postupe nepoužíva.

## Výsledná architektúra

```text
internet
  └─ Namecheap DNS
      └─ Hetzner VPS
          └─ Ploi / Nginx / Let's Encrypt (80, 443)
              ├─ gfcodes.com       → 127.0.0.1:3000 → Next.js web
              └─ api.gfcodes.com   → 127.0.0.1:4321 → Astro API
                                          └─ interná Docker sieť → Redis
```

Porty `3000`, `4321` a `6379` nesmú byť verejne otvorené. Ploi override ich
publikuje iba na loopback `127.0.0.1`; Redis sa nepublikuje vôbec.

## 1. Hetzner a Ploi

### Nový server

1. V Hetzner Cloud vytvor server s podporovaným Ubuntu LTS, ktorý Ploi ponúka.
   Pre tento projekt odporúčam aspoň 2 vCPU, 4 GB RAM a 40 GB disk.
2. Zapni Hetzner backups alebo pred prvým deployom vytvor snapshot.
3. V Ploi zvoľ **Add server** a:
   - pri novom čistom serveri vyber typ **Docker server**;
   - pri už existujúcom Ploi Webserveri môžeš pokračovať, ak na ňom fungujú
     `docker` a `docker compose`.
4. Ak ide o Custom server, skopíruj inštalačný príkaz priamo z Ploi a spusti ho
   cez SSH ako `root`. Príkaz z Ploi je jedinečný, preto ho nekopíruj z cudzieho
   návodu.
5. Po provisioningu pracuj ako používateľ `ploi`, nie ako `root`.

Kontrola cez SSH:

```sh
docker --version
docker compose version
git --version
```

Ak `docker compose` chýba, zastav sa a v Ploi reprovisionuj server ako Docker
server alebo doinštaluj Docker podľa aktuálneho Ploi postupu. Neinštaluj Caddy —
na portoch 80/443 už bude Ploi proxy.

## 2. Namecheap DNS

V Namecheap otvor **Domain List → gfcodes.com → Manage → Advanced DNS**. Host
Records fungujú iba vtedy, keď doména používa Namecheap BasicDNS, PremiumDNS
alebo FreeDNS. Ak používa iné nameservery, záznamy uprav u daného DNS providera.

Vytvor tieto záznamy, pričom `HETZNER_IPV4` nahraď verejnou IPv4 servera:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | `@` | `HETZNER_IPV4` | Automatic |
| CNAME Record | `www` | `gfcodes.com` | Automatic |
| A Record | `api` | `HETZNER_IPV4` | Automatic |

Odstráň Namecheap Parking, URL Redirect alebo staré A/CNAME záznamy, ktoré majú
rovnaký host `@`, `www` alebo `api`. `AAAA` pridaj iba vtedy, keď má VPS naozaj
nakonfigurovanú verejnú IPv6. Existujúci CAA záznam nesmie blokovať
`letsencrypt.org`.

Po uložení počkaj na DNS propagáciu a over ju na svojom Macu:

```sh
dig +short gfcodes.com
dig +short www.gfcodes.com
dig +short api.gfcodes.com
```

Prvý aj tretí príkaz musia vrátiť Hetzner IPv4. Certifikát ešte nevystavuj, kým
DNS neukazuje na nový server.

## 3. Repozitár na serveri

Repozitár sa klonuje iba raz, pretože obsahuje web aj API. V Ploi/GitHub nastav
deploy key, ak je repozitár súkromný, a potom cez SSH ako `ploi`:

```sh
cd /home/ploi
git clone git@github.com:Gabik7/b-r.io.git gfcodes.com
cd /home/ploi/gfcodes.com
cp .env.vps.example .env
chmod 600 .env
```

Ak už priečinok existuje, znovu ho neklonuj:

```sh
cd /home/ploi/gfcodes.com
git status
git pull --ff-only origin main
```

## 4. Produkčné secrets

Najjednoduchšie je vyplniť kartu **Environment** priamo v Ploi. Ploi uloží
hodnoty do `/home/ploi/gfcodes.com/.env`. Alternatívne súbor otvor cez SSH:

```sh
nano /home/ploi/gfcodes.com/.env
```

Povinné hodnoty:

| Premenná | Zdroj |
| --- | --- |
| `SITE_DOMAIN` | `gfcodes.com` |
| `API_DOMAIN` | `api.gfcodes.com` |
| `REDIS_PASSWORD` | nový náhodný reťazec; vytvor cez `openssl rand -base64 48` |
| `ENSELORA_GEMINI_API_KEY` | Google AI Studio / Gemini server key |
| `ENSELORA_GEMINI_MODEL` | `gemini-3.7-flash` |
| `ENSELORA_REPLICATE_API_TOKEN` | Replicate token začínajúci `r8_` |
| `ENSELORA_REPLICATE_BACKGROUND_MODEL` | úplný model a version hash z príkladu |
| `ENSELORA_REPLICATE_TRYON_MODEL_PRIMARY` | primárny Replicate Try-On model |
| `ENSELORA_REPLICATE_TRYON_MODEL_SECONDARY` | voliteľný porovnávací model; spočiatku prázdny |
| `ENSELORA_TRYON_COMPARE_ENABLED` | spočiatku `false` |
| `ENSELORA_REVENUECAT_SECRET_API_KEY` | RevenueCat secret key začínajúci `sk_` |
| `ENSELORA_REVENUECAT_WEBHOOK_AUTHORIZATION` | vlastný dlhý bearer secret, rovnaký ako v RevenueCat webhooku |
| `ENSELORA_REVENUECAT_WEBHOOK_SIGNING_SECRET` | vlastný webhook signing secret |
| `ENSELORA_TRYON_CREDIT_PRODUCTS_JSON` | mapa App Store product ID na počet kreditov |
| `ENSELORA_SUPABASE_URL` | URL samostatného ENSELORA Supabase projektu |
| `ENSELORA_SUPABASE_PUBLISHABLE_KEY` | publishable/anon key ENSELORA projektu |
| `ENSELORA_SUPABASE_SECRET_KEY` | serverový `sb_secret_...` key; nikdy nie do iOS klienta |
| `ENSELORA_APP_ATTEST_MODE` | pri prvom deploymente `off` |
| `ENSELORA_APP_ATTEST_APP_ID` | `P657J6X62B.com.gabriel.enselora` |
| `ENSELORA_APP_ATTEST_ENVIRONMENT` | pre TestFlight/produkciu `production` |
| `ENSELORA_ADMIN_API_KEY` | nový dlhý náhodný serverový secret |
| `ENSELORA_GEMINI_INPUT_MICROS_PER_MILLION` | `750000` – úvodná cena Gemini 3.7 Flash do 31. 12. 2026 |
| `ENSELORA_GEMINI_OUTPUT_MICROS_PER_MILLION` | `3750000` – úvodná cena Gemini 3.7 Flash do 31. 12. 2026 |
| ostatné `ENSELORA_*_COST_MICROS` | aktuálne nákladové odhady; do overenia môžu zostať `0` |
| `ENSELORA_DAILY_COST_ALERT_MICROS` | denný limit; `0` počas úvodného merania |
| `ENSELORA_COST_ALERT_WEBHOOK_URL` | voliteľný HTTPS alert webhook |

`ACME_EMAIL` môže zostať vyplnený, ale pri Ploi deploymente ho používať nebudeš.
Gemini, Replicate a RevenueCat secret nikdy nevkladaj do iOS aplikácie, Ploi UI
viditeľného webu ani do Gitu. Do tohto súboru nepatrí Supabase service-role key.

### ENSELORA API kontrakt

Produkčné endpointy sú:

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

Klientska požiadavka musí poslať `X-ENSELORA-Client: ios`, installation ID a
platný Supabase bearer JWT. API nemá anonymný bypass. Admin endpointy sa nikdy
nevolajú priamo z aplikácie.

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

Skontroluj, že nezostal placeholder:

```sh
grep -nE 'replace|sk_replace|r8_replace' /home/ploi/gfcodes.com/.env
```

Správny výsledok je bez výstupu.

## 5. Prvý Docker deploy

Ploi variant používa základný Compose súbor spolu s
`docker-compose.ploi.yml`. Override vypne Caddy a sprístupní web/API iba lokálne.

```sh
cd /home/ploi/gfcodes.com
docker compose \
  -f docker-compose.yml \
  -f docker-compose.ploi.yml \
  --env-file .env config

docker compose \
  -f docker-compose.yml \
  -f docker-compose.ploi.yml \
  --env-file .env build --pull

docker compose \
  -f docker-compose.yml \
  -f docker-compose.ploi.yml \
  --env-file .env up -d --remove-orphans

docker compose \
  -f docker-compose.yml \
  -f docker-compose.ploi.yml \
  --env-file .env ps
```

Očakávané služby sú `site`, `api` a `redis`; `caddy` nemá bežať. Najskôr over
aplikácie bez DNS a SSL priamo na serveri:

```sh
curl --fail http://127.0.0.1:3000/api/health
curl --fail http://127.0.0.1:4321/health
```

Web vráti `"ok":true`. API musí vrátiť `"ok":true` a
`"dependencies":{"redis":true}`. Ak nie, pozri logy podľa sekcie 9.

## 6. Prepojenie domén v Ploi

V Ploi vytvor dve samostatné sites/proxy väzby:

| Ploi site | Host | Port | Kontajner/služba |
| --- | --- | --- | --- |
| `gfcodes.com` | `127.0.0.1` | `3000` | `site` |
| `api.gfcodes.com` | `127.0.0.1` | `4321` | `api` |

Na Ploi Docker serveri otvor kontajner a použi **Link/Proxy site**. Vyber príslušnú
doménu a zadaj port z tabuľky. `www.gfcodes.com` pridaj ako alias webu a presmeruj
ho na `https://gfcodes.com`.

Ak tvoj typ servera nemá tlačidlo Link/Proxy, vytvor obe sites a v ich Nginx
configuration nahraď existujúci blok `location /` týmto. Pre web použi port 3000:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Pre API použi port 4321 a navyše veľkosť a timeout potrebný pre obrázky a Try-On:

```nginx
client_max_body_size 32m;

location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_http_version 1.1;
    proxy_read_timeout 130s;
    proxy_send_timeout 130s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Neduplikuj dva bloky `location /`. V Ploi ulož konfiguráciu s reloadom Nginx. Ak
ju upravuješ cez SSH, vždy najprv spusti `sudo nginx -t` a až potom reload.

## 7. HTTPS cez Ploi

HTTPS rieši iba Ploi — nie Caddy a nie Namecheap HTTPS toggle.

Pre každú site samostatne:

1. Otvor site v Ploi.
2. Choď na **SSL → Let's Encrypt**.
3. Pre web vyber `gfcodes.com` aj `www.gfcodes.com`; pre API vyber
   `api.gfcodes.com`.
4. Klikni **Save/Request certificate**.
5. Zapni presmerovanie HTTP → HTTPS.

Ploi nastaví automatické obnovovanie certifikátov. Ak vystavenie zlyhá, najskôr
porovnaj `dig +short` s Hetzner IPv4 a skontroluj konfliktné A/AAAA/CAA záznamy.

## 8. Verejná kontrola

```sh
curl --fail --show-error https://gfcodes.com/api/health
curl --fail --show-error https://api.gfcodes.com/health
curl --head https://www.gfcodes.com
```

Potom ručne otvor:

- `https://gfcodes.com`
- `https://gfcodes.com/apps/enselora`
- `https://gfcodes.com/privacy#enselora`
- `https://gfcodes.com/terms#enselora`
- `https://gfcodes.com/support#enselora`

Pred App Review v poslednom TestFlight builde otestuj prihlásenie, AI analýzu
kúsku, odstraňovanie pozadia, odporúčanie outfitu, Try-On a obnovu nákupu. Samotný
health endpoint nepotvrdzuje, že sú provider keys správne.

## 9. Logy a riešenie chýb

```sh
cd /home/ploi/gfcodes.com
docker compose \
  -f docker-compose.yml \
  -f docker-compose.ploi.yml \
  --env-file .env logs --tail=200 site api redis
```

Priebežné API logy:

```sh
docker compose \
  -f docker-compose.yml \
  -f docker-compose.ploi.yml \
  --env-file .env logs -f api
```

Najčastejšie stavy:

| Stav | Kontrola |
| --- | --- |
| Ploi 502 | `curl http://127.0.0.1:3000/api/health` alebo port 4321; kontajner nebeží alebo proxy používa zlý port |
| 413 | API Nginx nemá `client_max_body_size 32m` |
| 504 | API Nginx nemá 130 s timeout alebo provider neodpovedá |
| API health 503 | Redis nie je ready; pozri `api` a `redis` logy |
| API sa reštartuje | chýba povinná premenná alebo obsahuje placeholder; validátor ju vypíše |
| Let's Encrypt zlyhá | DNS ešte nesmeruje na VPS, je chybný AAAA/CAA alebo port 80 nie je dostupný |

Fotografie, base64 payloady, bearer tokeny a provider secrets nikdy nekopíruj do
verejného ticketu ani ich dlhodobo neloguj.

## 10. Automatický deploy v Ploi

Ako deploy script nastav:

```sh
cd /home/ploi/gfcodes.com
git pull --ff-only origin main
docker compose -f docker-compose.yml -f docker-compose.ploi.yml --env-file .env build --pull
docker compose -f docker-compose.yml -f docker-compose.ploi.yml --env-file .env up -d --remove-orphans
docker compose -f docker-compose.yml -f docker-compose.ploi.yml --env-file .env ps
curl --fail http://127.0.0.1:3000/api/health
curl --fail http://127.0.0.1:4321/health
```

Automatické nasadenie pri každom pushi zapni až po úspešnom prvom manuálnom
deploymente. Pri dvoch Ploi sites nastav deploy script iba na jednej, aby sa build
nespustil dvakrát.

## 11. Aktualizácia, rollback a zálohy

Pred väčšou aktualizáciou vytvor Hetzner snapshot. Bežný update používa deploy
script vyššie. Pri rollbacku checkoutni posledný overený commit a opäť spusti
Compose build a `up -d`; volume `redis_data` nemaž.

- Zapni Hetzner backups alebo pravidelné snapshoty.
- Redis používa AOF; zálohuj jeho volume alebo celý VPS.
- Supabase Database a Storage zálohuj nezávisle v ENSELORA projekte.
- Sleduj miesto na disku, RAM, restarty kontajnerov a Ploi/Nginx chyby.
- Pravidelne aktualizuj Ubuntu a Docker images.
- Po úniku secret okamžite rotuj u providera, zmeň Ploi Environment (`.env`) a
  znovu nasaď API.

## 12. Pridanie ďalšej aplikácie

Každá ďalšia aplikácia má vlastný API namespace, Redis prefix, environment prefix,
kvóty a samostatný Supabase projekt. Spoločný môže zostať Hetzner VPS, Ploi proxy,
doména a základný API kontajner; dáta a serverové secrets sa medzi aplikáciami
nezdieľajú.

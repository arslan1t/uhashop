# UHA SHOP

Website and back office for **UHA**, a basketball brand from Tashkent: a
sneaker and apparel marketplace with preorders, the brand's own merch line,
a 3×3 league and a youth academy — one Next.js app with three audiences:
shoppers, academy members and staff.

**Live:** [uhashop.uz](https://uhashop.uz)

## Features

**Store**
- Marketplace with categories, brands and product pages; curated *player sets*
  that bundle a full look.
- Cart, checkout with promo codes, wishlist and customer profiles.
- Every new order is stored in Firestore and pushed to the admins' Telegram chat.
- Russian, Uzbek and English interface (`next-intl`), light and dark themes.

**Academy**
- Separate portals for athletes, parents and coaches (`/academy`, `/trainer`).
- Applications, enrolment and payment notifications.
- Sign-in with a Telegram bot (deep link → shared contact → session) or with
  a password hashed with scrypt.

**League**
- Team registration and match management for the UHA 3×3 league.

**Admin panel** (`/admin`)
- Products, categories, brands, player sets and their order on the storefront.
- Homepage content, media, merch, promo codes, orders and users.
- Academy and league management, Telegram broadcasts, site settings.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, Framer Motion, lucide-react, next-themes |
| State | Zustand |
| i18n | next-intl — `messages/{ru,uz,en}.json` |
| Data | Firebase Firestore (client SDK + Admin SDK in API routes) |
| Auth | Telegram bot login, scrypt passwords, HMAC-signed sessions; optional Supabase auth for customer accounts |
| Files | Cloudflare R2 through the S3 API |
| Notifications | Telegram Bot API |
| Hosting | Vercel |

## Project structure

```
src/
├── app/
│   ├── (site)/[locale]/   storefront, academy, league — localised routes
│   ├── (admin)/admin/     back office
│   ├── (trainer)/trainer/ coach portal
│   └── api/               orders, auth, uploads, academy, league, Telegram webhook
├── components/            ui · layout · home · admin · academy
├── lib/
│   ├── firebase/          Firestore access per collection
│   ├── r2.ts              Cloudflare R2 uploads (server-only)
│   ├── telegram.ts        Bot API helpers
│   └── *-auth.ts          admin, trainer, academy and user sessions
├── store/                 Zustand stores (cart, wishlist, auth, catalogue overrides…)
└── i18n/                  locale routing
messages/                  translations
scripts/                   one-off maintenance scripts (see below)
```

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                         # http://localhost:3000
```

### Environment variables

| Group | Variables |
| --- | --- |
| Firebase (browser) | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` |
| Firebase Admin (server) | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_R2_PUBLIC_URL` |
| Telegram | `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_CHAT_ID` |
| Sessions & admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `USER_SESSION_SECRET` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| URLs | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` |

Only `NEXT_PUBLIC_*` values reach the browser; everything else is read in
server code and API routes only.

## Maintenance scripts

| Script | Purpose |
| --- | --- |
| `scripts/migrate-storage.mjs` | One-way move of every uploaded file from Firebase Storage to Cloudflare R2, rewriting the URLs stored in Firestore |
| `scripts/optimize-images.mjs` | Re-encodes `public/images` to WebP at a capped size (≈293 MB → 31 MB), keeping originals out of git |
| `scripts/bulk-upload-shorts.mjs` | Creates products in bulk from a folder of photos through the admin API |
| `scripts/rename-eric-emanuel.mjs` | One-off catalogue rename through the admin API |

The admin-API scripts read the password from the `ADMIN_PASSWORD` environment
variable — never hard-code it.

# Azalea Store

The Azalea online store: marketplace, product pages with photo and video reviews, cart, checkout with Paystack and OPay, customer accounts and a staff admin.

Built with Next.js, Supabase (database, logins, file storage) and Vercel (hosting).

## What's where

| Folder | What it holds |
| --- | --- |
| `app/` | Every page and API route. `app/admin` is the staff dashboard, `app/api` handles checkout and payments |
| `components/` | Reusable pieces: product card, cart drawer, checkout form, reviews, admin forms |
| `lib/` | Data loading, prices and delivery maths, payment provider code |
| `supabase/migrations/` | The database: tables, security rules, storage folders, starter products |
| `public/img/` | The starter product photos |

## Settings (environment variables)

Copy `.env.example` and fill in each value. On Vercel these go in **Project → Settings → Environment Variables**.

| Setting | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "service_role". Keep it secret: never share or commit it |
| `NEXT_PUBLIC_SITE_URL` | The store's address, e.g. `https://azalea.vercel.app` |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard → Settings → API Keys & Webhooks |
| `OPAY_MERCHANT_ID`, `OPAY_PUBLIC_KEY`, `OPAY_SECRET_KEY`, `OPAY_ENV` | OPay merchant dashboard |
| `ALLOW_TEST_PAYMENTS` | `true` while testing. Set to `false` once real payments are on |
| `TRANSFER_INSTRUCTIONS` | Optional. Bank details shown to customers who pay by transfer |

Without Paystack or OPay keys, checkout still works in **test mode**: those payment options open a test screen where you can simulate a successful or failed payment. No money moves.

## Going live with payments

1. **Paystack:** add `PAYSTACK_SECRET_KEY`, then in Paystack set the webhook URL to `https://<your-site>/api/paystack/webhook`.
2. **OPay:** add the three OPay keys and set `OPAY_ENV=live`. OPay sends payment updates to `https://<your-site>/api/opay/webhook`. Check `lib/payments.js` against OPay's current docs before switching to live.
3. Set `ALLOW_TEST_PAYMENTS=false` and redeploy.

An order is only marked **paid** after the store asks Paystack or OPay to confirm it. Stock drops at that moment.

## Making someone staff

New sign-ups are customers. To make the first owner, run this once in Supabase → SQL Editor, using the email that signed in on the site:

```sql
update public.profiles set role = 'owner' where email = 'owner@example.com';
```

The owner can then promote staff the same way, using `'staff'`.

## Running it on your computer (optional)

1. Install Node.js 20 or newer from nodejs.org.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env.local` and fill it in.
4. Run `npm run dev` and open http://localhost:3000.

Without Supabase settings, the site still runs using the starter catalogue in `lib/seed-data.js`, so you can preview the design. Accounts, checkout and admin need Supabase.

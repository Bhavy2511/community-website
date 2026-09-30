# Gujarati Community IITG Website

The official community website for Gujarati students, faculty, alumni and friends at IIT Guwahati.

Live site: [gujarati-community-iitg.vercel.app](https://gujarati-community-iitg.vercel.app/)

## What is included

- A five-slide animated landing page with curtain page transitions.
- Dedicated pages for GarbaRaas, Nutan Varsh Milan, Farewell, Sharad Poonam, vision, archive, food guide, directory and contact.
- A year-wise event structure. GarbaRaas 2025 is published; 2022-24 are ready for curated albums; GarbaRaas 2026 is a coming-soon page.
- A Core Team directory with 2025-26 and 2026-27 rosters, verified guiding professors and supplied portraits.
- A Members directory sourced only from MongoDB, with search, filters and 20-member pagination.
- Contact, membership, mentorship and GarbaRaas merch-order notifications sent through AgentMail.
- Google Maps, community WhatsApp groups, Instagram and the official membership Google Form.

## Technology

- Next.js 14 and React 18
- MongoDB Atlas with Mongoose
- AgentMail for email notifications
- Vercel deployment from the `main` branch

## Local development

Requirements: Node.js 20 or later and access to the project MongoDB Atlas database.

```bash
git clone https://github.com/DhruvPansuriya/Gujarati-Community-IITG-Website.git
cd Gujarati-Community-IITG-Website
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the local page returns a Next.js module error or loads without styles, stop the dev server, move the generated `.next` directory aside, then run `npm run dev` again. The `.next` directory is generated and is never committed.

## Environment variables

Copy `.env.example` to `.env.local` and set the following values. Never commit `.env.local`.

| Variable | Required for | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Members directory and forms | Use the same valid Atlas URI as production. |
| `MONGODB_DB_NAME` | MongoDB selection | Use `gujarati-community-iitg` unless the Atlas deployment uses another explicitly configured database. |
| `AGENTMAIL_API_KEY_COMMUNITY` | Community notifications | Server-only AgentMail API key for community forms. |
| `AGENTMAIL_API_KEY_GARBARAAS` | Kurta notifications | Server-only AgentMail API key for GarbaRaas kurta orders. |
| `AGENTMAIL_INBOX` | Automated notifications | Sending inbox, for example `gujaraticommunityiitg@agentmail.to`. |
| `CONTACT_TO_EMAIL` | Automated inquiry emails | Community inbox, currently `gujaraticommunityiitg@gmail.com`. |
| `KURTA_ORDER_CONTACT_EMAIL` | Kurta-order review alerts | GarbaRaas team inbox, currently `garbaraasiitg@gmail.com`. |
| `KURTA_ORDER_AGENTMAIL_INBOX` | Kurta-order sender | GarbaRaas AgentMail inbox, currently `garbaraas.iitg@agentmail.to`. |
| `CHANDA_SESSION_SECRET` | Chanda POC login | A separate long random server-only secret for POC sessions. |
| `CHANDA_PAYMENT_QR_URL` | Chanda online payment | Optional public QR image path or URL override. By default, the complete Senate / Canara Bank QR page at `public/payment-qrs/chanda-senate-full.png` is used. |
| `CHANDA_AGENTMAIL_INBOX` | Chanda thank-you receipts | Optional GarbaRaas sending inbox. Falls back to the configured GarbaRaas inbox. |
| `CHANDA_POC_REQUEST_TO_EMAIL` | New POC request alerts | Defaults to `r.pansuriya@iitg.ac.in`; receives the Chanda-admin approval link. |
| `NEXT_PUBLIC_SITE_URL` | Pickup QR links | Set production to `https://gujarati-community-iitg.vercel.app`; keep localhost in local development. |

## GarbaRaas merch orders

The Kurta workflow supports up to four kurtas per order. Pricing is ₹499 for one kurta and ₹449 per kurta when ordering two to four. The payment screen selects the matching QR asset for ₹499, ₹898, ₹1,347 or ₹1,796 from `public/kurta-payment-qr/`.

After submission, each order receives a unique pickup token and code. The QR opens the order-specific collection route:

```text
/admin/kurta-orders/collect?token=<unique-token>
```

Production pickup links use `NEXT_PUBLIC_SITE_URL` (or Vercel's `VERCEL_URL` fallback); local links use the local site URL. Delivery is recorded once per order, and the customer receives a delivery-confirmation email after collection. Order and delivery emails include the customer's order details, pickup information, query contacts, a clickable Instagram link and a clickable GarbaRaas 2026 website link.

Koti order and collection routes use the same token-based flow with Koti-specific routes and codes. Keep the relevant merch-order feature flag enabled only when that collection is accepting orders.

## Chanda collection

The POC workspace is at `/chanda` and has no public navigation entry. It accepts POC sign-up requests, but a request stays pending and cannot collect Chanda. The separate Chanda-admin dashboard reviews requests hostel-wise, generates up to 20 random four-digit codes per hostel, and assigns an available code to the selected POC. Only then can that POC sign in with their IITG email, roll number and assigned code. Codes are scrypt-hashed in the database and newly generated plaintext codes are shown once only. POC sessions expire after one hour, disabled accounts are rejected on every authenticated request, and the POC session never returns collection totals, historical donor records or other POCs' details. `CHANDA_SESSION_SECRET` should be an independent secret of at least 32 characters. If it is not set, the server derives a purpose-specific Chanda signing key from a sufficiently long `SESSION_SECRET`, so it never directly reuses the admin session signature.

Each contribution stores the donor, donor hostel, IITG email, amount, payment method, timestamp and authenticated POC link. Each browser form also carries a one-time submission key, so a retried request returns the original receipt instead of creating a duplicate collection. The admin Chanda desk provides the confidential receipt register, POC approval, overall totals and donor-hostel totals. After a contribution is recorded, the system sends a GarbaRaas thank-you email when an AgentMail key is configured. Online Chanda payments use the complete Senate / Canara Bank QR page at `public/payment-qrs/chanda-senate-full.png` unless `CHANDA_PAYMENT_QR_URL` supplies a replacement. The QR itself may be public, but never place a UPI secret, database credential or payment-provider API key in a client-side variable.

Current safeguards include pending approval plus a hostel-bound assigned code, one-hour signed HTTP-only sessions, immediate disabled-account enforcement, server-side validation, IITG email restrictions, rate controls, idempotent submissions, admin audit logs for POC access changes, and spreadsheet-injection-safe CSV export. Recommended future upgrades are IITG email OTP login instead of roll-number passwords, admin two-factor authentication, payment-gateway webhook verification, immutable correction/reversal entries, automated anomaly alerts, encrypted backups and a documented data-retention policy.

## Separate Chanda-admin access

The normal `/admin` account is required first. Opening `/admin/chanda` then requires a second Chanda-specific sign-in with the fixed server-side email `garbaraas.iitg@gmail.com` and a separately hashed password. The Chanda-admin session lasts one hour and is stored in its own HTTP-only cookie. Generate the hash on the machine where the password is chosen, without pasting the password into source code or chat:

```bash
read -s "CHANDA_ADMIN_PASSWORD?Choose the Chanda admin password: "
printf '\n'
CHANDA_ADMIN_PASSWORD="$CHANDA_ADMIN_PASSWORD" node scripts/hash-chanda-admin-password.mjs
unset CHANDA_ADMIN_PASSWORD
```

Copy the printed `CHANDA_ADMIN_PASSWORD_HASH` line into `.env.local`, set the same value in Vercel environment variables, and redeploy. `CHANDA_ADMIN_SESSION_SECRET` should be a separate random value of at least 32 characters.

The Members directory deliberately has no sample-person fallback. If MongoDB is unavailable, the UI shows an availability message instead of fabricated member data.

## Member database and privacy

The import script stores the complete approved form response privately in MongoDB. The public API returns only these fields:

- Name
- Degree/programme
- Department
- Graduation year
- Student, alumni, faculty or core-team status

Phone numbers, email addresses, hostel details and the original source response are never returned by `GET /api/members`.

Import an approved Excel sheet without deleting existing profiles:

```bash
npm run import:members -- "/absolute/path/to/responses.xlsx" --apply
```

For an approved roster-only update, use the non-destructive core-team helper:

```bash
npm run seed:core
```

## Contact and email delivery

`POST /api/contact` validates an inquiry, uses a hidden honeypot to reduce spam and writes it to MongoDB. When `AGENTMAIL_API_KEY` is set, it also forwards the inquiry from the configured AgentMail inbox to `CONTACT_TO_EMAIL`.

Without a valid AgentMail key, a successful inquiry is stored but not emailed. This is intentional so that the form never falsely claims delivery.

## Repository structure

```text
src/app/                 Pages and API routes
src/components/          Reusable UI, sliders, directory and transitions
src/data/                Curated content, event photos and core-team rosters
src/models/              MongoDB schemas
scripts/                 Safe member-import utilities
public/community/        Optimised event, team and logo assets
```

## Adding future content

1. Add event photos under `public/community/<event>-<year>/` without changing image aspect ratios.
2. Register the curated photos in `src/data/event-photos.js`.
3. Add the year entry to the relevant `EventYearNav` on the event page.
4. Use the existing 12-photo archive-grid pattern for event albums.
5. Update `src/data/core-team.js` only after a roster and photo consent are confirmed.

## Deployment

Push approved work to `main`:

```bash
git push origin main
```

Vercel deploys the connected `main` branch. Add the same MongoDB and AgentMail variables in the Vercel project settings before relying on directory data or automated email in production.

## Maintainer notes

- Do not commit database URIs, AgentMail keys, passwords or unapproved phone numbers.
- Keep event pages factual. Use “coming soon” or “archive in preparation” until dates, images and details are confirmed.
- Preserve the existing editorial theme, active navigation state, curtain transition and responsive image cropping when extending the site.

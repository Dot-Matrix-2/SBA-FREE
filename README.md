# freesbainfo.com

Free, plain-English information about SBA 7(a) term loans, an anonymous eligibility quiz, and an optional lender referral. Built with [Astro](https://astro.build) (static) and Cloudflare Pages Functions + D1.

## Local development

Requires Node 20+.

```bash
npm install
npm run dev          # site at http://localhost:4321 (no API)
npm test             # quiz rules + lead validation tests
npm run build        # outputs ./dist
```

To run the site **with** the lead API locally:

```bash
cp .dev.vars.example .dev.vars
cp .env.example .env
npm run db:local     # create the local D1 database
npm run build && npm run preview
```

## Project layout

| Path | Purpose |
|---|---|
| `src/pages/` | Pages. `learn/*.md` are the article pages. |
| `src/lib/quiz/questions.ts` | Quiz questions and answer options |
| `src/lib/quiz/rules.ts` | Eligibility rules (`evaluate`), unit-tested |
| `src/lib/consent.ts` | Consent wording and version stored with every lead |
| `functions/api/lead.ts` | `POST /api/lead`: validate, Turnstile check, save to D1, deliver to lenders |
| `functions/_lib/lenders/` | Lender delivery adapters |
| `migrations/` | D1 schema |

## Deploying (Cloudflare Pages + Porkbun)

1. **Push to GitHub.** Create a repo and push this project.
2. **Create the D1 database:** `npx wrangler d1 create freesbainfo`, then paste the `database_id` into `wrangler.toml`. Apply the schema: `npx wrangler d1 migrations apply freesbainfo --remote`.
3. **Create a Turnstile widget** in the Cloudflare dashboard (Turnstile) for `freesbainfo.com`.
4. **Create the Pages project:** Cloudflare dashboard > Workers & Pages > Create > Pages > connect the GitHub repo.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable (build): `PUBLIC_TURNSTILE_SITE_KEY` = your Turnstile site key
   - Environment variable / secret (runtime): `TURNSTILE_SECRET` = your Turnstile secret key
   - Settings > Functions > D1 bindings: variable `DB` = the `freesbainfo` database
5. **Add the domain:** Pages project > Custom domains > `freesbainfo.com` (and `www`).
   - Easiest: add the domain to Cloudflare, then in Porkbun change the domain's **nameservers** to the two Cloudflare provides.
   - Alternative: keep Porkbun DNS and add the CNAME records Cloudflare shows (apex CNAME needs a provider that supports flattening, so nameservers are simpler).
6. Cloudflare provisions HTTPS automatically.

## Connecting lenders

Each lender is a delivery adapter. Until real lender APIs are available, the generic webhook adapter can be configured with Pages secrets:

```
LENDER_1_NAME=Acme Bank
LENDER_1_URL=https://...
LENDER_1_KEY=...
```

(up to `LENDER_5`). With none configured, leads are saved to D1 and marked `skipped`.

When you receive a lender's API documentation, add a dedicated adapter in `functions/_lib/lenders/` (field mapping, auth scheme) and register it in `getLenders`. Every attempt is recorded in the `deliveries` table, so failed deliveries can be found and retried:

```bash
npx wrangler d1 execute freesbainfo --remote --command "SELECT * FROM deliveries WHERE status = 'failed'"
```

## Before launch checklist

- [ ] Have an attorney review Privacy Policy, Terms, Disclosures, and the consent wording (TCPA, state lead-generation / broker licensing rules, compensation disclosure).
- [ ] Add a contact email in `src/pages/privacy.md` and `src/pages/terms.md`.
- [ ] Verify every number in `src/pages/learn/*.md` (rates, fees, guarantee percentages, size and ownership rules) against sba.gov and SOP 50 10, and update the "reviewed" dates.
- [ ] Set up Turnstile keys and the D1 binding in production.

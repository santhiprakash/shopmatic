# Platform status — Shopify-simple bar

**Updated:** 2026-08-13  
**Owner:** Santhi Prakash  
**Purpose:** Honest “what is in the box” so we know when Shopmatic is ready to promote, and so later contributors do not rebuild the wrong thing.

Shopify’s first hour is: create account → name store → pick theme → add a product → get a URL. That is the bar. We do **not** need every Shopify feature. We need that hour to feel obvious.

## Ready enough to dogfood

| Surface | In the code | Notes |
| --- | --- | --- |
| Marketing site | `/`, `/features`, `/pricing`, `/about-us` | Live domain [shopmatic.cc](https://shopmatic.cc) |
| Sign up / sign in | Header modal | Not a dedicated `/login` route |
| Demo login | `AuthContext.loginDemo` | Useful for “try before register”; skips the wizard modal |
| Email verify / reset | `/verify-email`, `/forgot-password`, `/reset-password` | Needs Emailit in production |
| First-hour wizard | Global `OnboardingWizard` | Required handle + first product; theme optional; then copy share URL |
| Public handle | `users.username` | Live check `GET /api/users/check-username/:username`; edit on Profile |
| Dashboard | `/dashboard` | Real checklist: handle, product, share |
| Products | `/my-products` | Empty state CTA opens add form |
| Analytics | `/analytics` | Basic; dashboard hides fake monthly charts for empty catalogs |
| Public storefront | `/@username`, `/@username/:collectionSlug` | OG tags exist |
| Themes | Theme customizer in settings | Light/dark + colors; optional in first hour |
| Affiliate IDs | Amazon / Flipkart / Myntra / Nykaa | Server route `affiliateIds`; optional secondary |
| Legal | `/privacy`, `/terms`, `/cookies` | |
| Help | `/help-center`, `/documentation` | In-app docs page |
| Seed data | `npm run db:seed` | `demo@shopmatic.cc` |

## Not ready — do not promote as if these exist

| Gap | Why it matters for “easy like Shopify” | Suggested next build |
| --- | --- | --- |
| Sample store on first login | Empty catalog is honest now; some users still want examples | Auto-seed 3 demo products, mark them “example” |
| Payments | PRD lists Razorpay; not wired | Keep Free plan only until checkout is real |
| Custom domain | Listed on Pro; not implemented | Defer until after first-run is proven in prod |
| Teams / white-label | Enterprise row in PRD | Out of scope for launch |
| CSV/Excel import | Mentioned as a next step | After URL paste is airtight |
| Social proof / verification badges | PRD lists them | Later |

## What to put inside the platform (launch contents)

Treat this as the **minimum catalog of product surfaces**, not a wish list.

### 1. First hour (must feel Shopify-easy)

Shipped in `feat/first-hour-core`:

1. Create account (email + password).
2. Pick a public handle (`/@name`) — one field, live availability check. Required; wizard cannot finish without it.
3. Paste **one** product URL (Quick Add) or fill a short form. Continue is disabled until `products.length >= 1`.
4. See the public page. Copy share link (WhatsApp / copy) from the last wizard step, dashboard, or Profile.
5. Optional: pick a theme. Default theme must look finished without this step.

### 2. Everyday curator loop

- Add / edit / hide products
- Collections (named groups)
- Affiliate IDs applied automatically on supported shops
- Click analytics that a human can explain in one sentence

### 3. Trust (required before ads)

- FTC/affiliate disclosure on every public page
- Content policy (already sketched in user-flow docs)
- Working privacy + terms
- No secrets in `VITE_*` (JWT belongs on the server only)

### 4. Empty states

- `/my-products` uses `EmptyProductsState` with **Add your first product**.
- Dashboard analytics empty state CTAs: **Add your first product** or **Choose your public handle**.
- Fake Jan–Dec “products added over time” chart is hidden (it was not real user data).

## Doc debt we are paying down

| Problem | Action |
| --- | --- |
| README cloned `yourusername/shopmatic-platform` | Fixed in README |
| `.env.example` contained a merge conflict | Fixed |
| README / PRD still mention Supabase or `VITE_JWT_SECRET` | Called out; backend is Express + `JWT_SECRET` |
| `scripts/update-env-demo.js` wrote `VITE_JWT_SECRET` | Fixed — writes `JWT_SECRET` only |
| `DEPLOYMENT.md` / `docs/neon-setup.md` told people to put JWT in `VITE_*` | Fixed |
| `PHASES.md` / `LAUNCH_PLAN.md` last dated April 2026 | Left in place as history; **this file** is current status |
| `USER_FLOW_DOCUMENTATION.md` is 70k+ and duplicated sections | Do not extend it; change GETTING_STARTED + this file instead |
| Vercel preview `npm install` failed: Vite 8 vs `@vitejs/plugin-react-swc` 3.x peer range | Bumped plugin to 4.3.x (supports Vite 8) |

## Suggested contributor lanes (pick one)

Small, self-contained work that moves the Shopify bar:

1. ~~**Onboarding wizard**~~ — shipped: required handle + first product; skip does not complete without a username.
2. ~~**Empty-state CTAs**~~ — shipped on dashboard + my-products.
3. **Demo store polish** — seed 3 real, disclosed example products; hide from public SEO if marked `example`.
4. ~~**First-product checklist**~~ — shipped on the dashboard (handle, product, share).
5. ~~**Env hardening**~~ — no new `VITE_JWT_SECRET` / `VITE_NEON_DATABASE_URL` in `src/`; demo env script no longer writes `VITE_JWT_SECRET`.

Do not open a PR that only rewrites more strategy docs.

## Social launch gate

Do **not** start paid or broad social promotion until:

- [x] A new user can complete the first-hour path without a human walking them through it
- [ ] Public ` /@username` looks finished with one product and the default theme
- [ ] Email verify + password reset work on production
- [x] GETTING_STARTED matches the live buttons and URLs
- [ ] No merge-conflict markers or placeholder images on the landing page

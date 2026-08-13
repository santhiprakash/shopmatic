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
| Demo login | `AuthContext.loginDemo` | Useful for “try before register” |
| Email verify / reset | `/verify-email`, `/forgot-password`, `/reset-password` | Needs Emailit in production |
| Dashboard | `/dashboard` | Protected |
| Products | `/my-products` | Manual + AI Quick Add |
| Analytics | `/analytics` | Basic |
| Public storefront | `/@username`, `/@username/:collectionSlug` | OG tags exist |
| Themes | Theme customizer in settings | Light/dark + colors |
| Affiliate IDs | Amazon / Flipkart / Myntra / Nykaa | Server route `affiliateIds` |
| Legal | `/privacy`, `/terms`, `/cookies` | |
| Help | `/help-center`, `/documentation` | In-app docs page |
| Seed data | `npm run db:seed` | `demo@shopmatic.cc` |

## Not ready — do not promote as if these exist

| Gap | Why it matters for “easy like Shopify” | Suggested next build |
| --- | --- | --- |
| Guided first-run wizard | New users land on a dashboard, not a 4-step “name store → add product → share” | A single `/onboarding` flow that cannot be skipped until username + 1 product exist |
| Sample store on first login | Empty catalog feels broken | Auto-seed 3 demo products, mark them “example” |
| Payments | PRD lists Razorpay; not wired | Keep Free plan only until checkout is real |
| Custom domain | Listed on Pro; not implemented | Defer until after first-run wizard |
| Teams / white-label | Enterprise row in PRD | Out of scope for launch |
| CSV/Excel import | Mentioned as next step | After URL paste is airtight |
| Social proof / verification badges | PRD lists them | Later |

## What to put inside the platform (launch contents)

Treat this as the **minimum catalog of product surfaces**, not a wish list.

### 1. First hour (must feel Shopify-easy)

1. Create account (email + password).
2. Pick a public handle (`/@name`) — one field, live availability check.
3. Paste **one** product URL (Quick Add) or fill a short form.
4. See the public page. Copy share link (WhatsApp / X / copy).
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

Every empty screen needs one primary button (“Add your first product”), not a blank table.

## Doc debt we are paying down

| Problem | Action |
| --- | --- |
| README cloned `yourusername/shopmatic-platform` | Fixed in README |
| `.env.example` contained a merge conflict | Fixed |
| README / PRD still mention Supabase or `VITE_JWT_SECRET` | Called out; backend is Express + `JWT_SECRET` |
| `PHASES.md` / `LAUNCH_PLAN.md` last dated April 2026 | Left in place as history; **this file** is current status |
| `USER_FLOW_DOCUMENTATION.md` is 70k+ and duplicated sections | Do not extend it; change GETTING_STARTED + this file instead |

## Suggested contributor lanes (pick one)

Small, self-contained work that moves the Shopify bar:

1. **Onboarding wizard** — `/onboarding` after first register if username or product count is 0.
2. **Empty-state CTAs** — dashboard + my-products when the catalog is empty.
3. **Demo store polish** — seed 3 real, disclosed example products; hide from public SEO if marked `example`.
4. **First-product checklist** on the dashboard (handle, product, share).
5. **Env hardening** — remove any remaining `VITE_JWT_SECRET` / `VITE_NEON_DATABASE_URL` from frontend code.

Do not open a PR that only rewrites more strategy docs.

## Social launch gate

Do **not** start paid or broad social promotion until:

- [ ] A new user can complete the first-hour path without a human walking them through it
- [ ] Public ` /@username` looks finished with one product and the default theme
- [ ] Email verify + password reset work on production
- [ ] GETTING_STARTED matches the live buttons and URLs
- [ ] No merge-conflict markers or placeholder images on the landing page

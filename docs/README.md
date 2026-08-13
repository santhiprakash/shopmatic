# Shopmatic documentation

**Live site:** [shopmatic.cc](https://shopmatic.cc) · **Repo:** [santhiprakash/shopmatic](https://github.com/santhiprakash/shopmatic)

Start here. Older long-form files stay in this folder for history; this index is the current map.

| If you want to… | Read |
| --- | --- |
| Run the app in 15 minutes | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| See what is built vs still missing (Shopify-simple bar) | [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) |
| Contribute code or docs | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| Deploy | [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| Set up Neon Postgres | [neon-setup.md](./neon-setup.md) |
| Understand pricing tiers | [PRICING_AND_FEATURES.md](./PRICING_AND_FEATURES.md) |

## Product in one sentence

Shopmatic is an open-source storefront for **curators** (influencers and affiliate marketers). Paste a product URL, get a public page at `/@username`, share it.

The onboarding bar we are aiming for is **Shopify-simple**: sign up → name the store → add one product → publish a link you can share.

## Source of truth

Code wins over docs. If this index and an older file disagree, believe the code and update this index.

| Topic | Current source |
| --- | --- |
| Stack | Vite + React 18 + Express on port **3001** + Neon Postgres. JWT lives on the **server** (`JWT_SECRET`), not in `VITE_*`. |
| Public storefront | `/@username` and `/@username/:collectionSlug` |
| Auth | Header modal (login / register), plus `/forgot-password`, `/reset-password`, `/verify-email`. Demo login exists in `AuthContext`. |
| Domain | **shopmatic.cc** (not shopmatic.net, not shopmatic-platform). |

Historical / deep-dive files (may be dated — check the header date):

- [PRD.md](./PRD.md) — product requirements (some “Supabase” lines are stale; backend is Express + Neon)
- [PHASES.md](./PHASES.md) — implementation phases (last dated 2026-04-03)
- [LAUNCH_PLAN.md](./LAUNCH_PLAN.md) — launch checklist (last dated 2026-04-02)
- [USER_FLOW_DOCUMENTATION.md](./USER_FLOW_DOCUMENTATION.md) — long user-flow draft
- [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) — architecture dump
- [archive/](./archive/) — superseded notes

## For later contributors

When you change a user-facing flow (signup, first product, public page, env vars), update **GETTING_STARTED** and **PLATFORM_STATUS** in the same PR. Do not add a fourth “source of truth.”

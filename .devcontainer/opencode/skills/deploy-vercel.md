---
description: Deploy application to Vercel with environment management
---

# Deploy to Vercel

This workflow guides you through deploying your application to Vercel.

## Prerequisites

1. Vercel CLI installed: `npm i -g vercel`
2. Logged in to Vercel: `vercel login`
3. `VERCEL_TOKEN` environment variable set (for CI/CD)

## Steps

### 1. Initial Setup (First Time Only)

```bash
# Link project to Vercel
vercel link

# Set up environment variables
vercel env add DATABASE_URL
vercel env add AUTH0_DOMAIN
vercel env add AUTH0_CLIENT_ID
vercel env add AUTH0_CLIENT_SECRET
vercel env add R2_ENDPOINT
vercel env add R2_ACCESS_KEY
vercel env add R2_SECRET_KEY
vercel env add R2_BUCKET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add NEXT_PUBLIC_GA_ID
vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY
vercel env add TURNSTILE_SECRET_KEY
```

### 2. Preview Deployment

```bash
# Deploy to preview environment
vercel

# Or with specific environment
vercel --env preview
```

### 3. Production Deployment

```bash
# Deploy to production
vercel --prod
```

### 4. Verify Deployment

After deployment, verify:
- [ ] Application loads correctly
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] R2 uploads/downloads work
- [ ] Emails send correctly
- [ ] Analytics tracking works
- [ ] Turnstile verification works

## Rollback

If issues occur:

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

## Tips

- Use `vercel dev` for local development with Vercel environment
- Use `vercel env pull .env.local` to sync environment variables locally
- Create a `vercel.json` for custom build settings

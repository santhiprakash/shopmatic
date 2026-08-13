# Shopmatic Deployment Guide

Complete guide for deploying Shopmatic to production using NeonDB (PostgreSQL) and Emailit for notifications.

## Prerequisites

Before deploying, ensure you have:

1. **NeonDB Account** - https://neon.tech
2. **Emailit Account** - https://emailit.com
3. **Domain configured** - shopmatic.cc
4. **Hosting platform** - Vercel, Netlify, or similar

---

## 1. Database Setup (NeonDB)

### Step 1: Create NeonDB Project

1. Sign up at https://neon.tech
2. Create a new project named **"shopmatic"**
3. Select region closest to your users
4. Copy the connection string (format: `postgresql://user:password@hostname.neon.tech/shopmatic?sslmode=require`)

### Step 2: Run Database Migrations

```bash
# Install PostgreSQL client if not already installed
# macOS
brew install postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql-client

# Run the migration
psql "YOUR_NEON_DATABASE_URL" -f migrations/001_initial_schema.sql
```

Alternatively, use the NeonDB SQL Editor in their dashboard:
1. Go to your Neon project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Execute the migration

### Step 3: Verify Database Setup

```sql
-- Connect to your database and verify tables
\dt

-- Should show:
-- users
-- products
-- categories
-- affiliate_ids
-- analytics
-- password_reset_tokens
-- email_unsubscribes
```

---

## 2. Email Service Setup (Emailit)

### Step 1: Create Emailit Account

1. Sign up at https://emailit.com
2. Verify your sending domain: **shopmatic.cc**
3. Add sender address: **notifications@shopmatic.cc**

### Step 2: Configure DNS Records

Add these DNS records to your domain (shopmatic.cc):

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:emailit.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: emailit._domainkey
Value: [Provided by Emailit dashboard]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@shopmatic.cc
```

### Step 3: Get API Key

1. Navigate to Emailit dashboard > API Keys
2. Create new API key with name "Shopmatic Production"
3. Copy the API key (starts with `eit_`)

---

## 3. Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` with your production values:

```bash
# API Keys
VITE_OPENAI_API_KEY=sk-your-openai-key

# NeonDB Configuration (PostgreSQL) — server only
DATABASE_URL=postgresql://user:password@your-neon-hostname.neon.tech/shopmatic?sslmode=require
JWT_SECRET=use-openssl-rand-base64-32

# Emailit Configuration (emailit.com)
EMAILIT_API_KEY=eit_your_emailit_api_key
EMAILIT_FROM_EMAIL=notifications@shopmatic.cc
EMAILIT_FROM_NAME=Shopmatic

# Environment
VITE_ENV=production

# Application Settings
VITE_APP_NAME=Shopmatic
VITE_APP_URL=http://localhost:8080
VITE_DOMAIN=shopmatic.cc
VITE_PRODUCTION_URL=https://shopmatic.cc

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ADVANCED_FEATURES=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## 4. Build & Deployment

### Option A: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Configure Vercel Environment Variables:**
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add all variables from `.env` file
3. Ensure they're available for **Production** environment

**Configure Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Configure Netlify Environment Variables:**
1. Go to Netlify Dashboard > Site Settings > Environment Variables
2. Add all variables from `.env` file

**netlify.toml Configuration:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option C: Self-Hosted (VPS)

```bash
# On your server
git clone https://github.com/your-repo/shopmatic.git
cd shopmatic

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or similar
# Configure nginx to serve from ./dist directory
```

---

## 5. Domain Configuration

### Step 1: Configure DNS

Point your domain to your hosting provider:

**For Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

### Step 2: SSL Certificate

- Vercel: Automatic SSL with Let's Encrypt
- Netlify: Automatic SSL with Let's Encrypt
- Self-hosted: Use Certbot

```bash
# For self-hosted with Certbot
sudo certbot --nginx -d shopmatic.cc -d www.shopmatic.cc
```

---

## 6. Post-Deployment Checklist

### Email Deliverability

- [ ] Verify SPF, DKIM, DMARC records are configured
- [ ] Test email sending with `npm run test:email`
- [ ] Check email deliverability at https://www.mail-tester.com
- [ ] Verify unsubscribe links work correctly

### Database

- [ ] Verify all tables are created
- [ ] Check database connection from production
- [ ] Set up automated backups in Neon dashboard
- [ ] Configure connection pooling if needed

### Security

- [ ] All environment variables are set correctly
- [ ] API keys are not exposed in client-side code
- [ ] HTTPS is enforced
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled

### Performance

- [ ] Enable CDN for static assets
- [ ] Configure caching headers
- [ ] Enable gzip/brotli compression
- [ ] Test page load speed with Lighthouse

### Monitoring

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database query performance monitoring
- [ ] Enable analytics

---

## 7. Testing Email Functionality

Create a test script to verify email sending:

```javascript
// test-email.js
import emailService from './src/services/EmailService';

async function testEmail() {
  console.log('Testing email service...');

  const result = await emailService.sendWelcomeEmail(
    'test@example.com',
    'Test User'
  );

  console.log('Email sent:', result);
}

testEmail();
```

Run the test:
```bash
node test-email.js
```

---

## 8. Database Backup & Recovery

### Automated Backups (NeonDB)

NeonDB provides automatic backups:
1. Go to Neon Dashboard > Your Project > Backups
2. Enable "Point-in-time restore"
3. Configure retention period (recommended: 7-30 days)

### Manual Backup

```bash
# Backup database
pg_dump "YOUR_NEON_DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Restore from backup
psql "YOUR_NEON_DATABASE_URL" < backup_20250101.sql
```

---

## 9. Monitoring & Maintenance

### Database Monitoring

Monitor these metrics in NeonDB dashboard:
- Connection count
- Query performance
- Storage usage
- Response time

### Email Monitoring

Monitor in Emailit dashboard:
- Delivery rate
- Bounce rate
- Open rate (if tracking enabled)
- Spam complaints

### Application Monitoring

Recommended tools:
- **Error Tracking:** Sentry (https://sentry.io)
- **Performance:** Vercel Analytics or Google Analytics
- **Uptime:** UptimeRobot (https://uptimerobot.com)

---

## 10. Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql "YOUR_NEON_DATABASE_URL" -c "SELECT version();"

# Check if migrations ran successfully
psql "YOUR_NEON_DATABASE_URL" -c "\dt"
```

### Email Sending Issues

1. **Emails not sending:**
   - Check EMAILIT_API_KEY is correct
   - Verify domain is verified in Emailit dashboard
   - Check DNS records (SPF, DKIM, DMARC)

2. **Emails going to spam:**
   - Warm up your sending domain gradually
   - Ensure SPF/DKIM/DMARC are configured
   - Add unsubscribe links (already included in templates)

3. **Unsubscribe not working:**
   - Check unsubscribe URL in emails
   - Verify database table `email_unsubscribes` exists

### Build Issues

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 11. Scaling Considerations

### Database Scaling

NeonDB automatically scales, but monitor:
- Active connections (max 20 in pool)
- Query performance
- Consider read replicas for high traffic

### Email Rate Limits

Emailit rate limits:
- Free tier: 100 emails/day
- Paid tier: Based on plan

Monitor sending volume and upgrade plan if needed.

### Application Performance

Consider:
- Implementing Redis for caching
- Using CDN for static assets
- Enabling server-side rendering for SEO
- Implementing lazy loading for products

---

## 12. CAN-SPAM Compliance Checklist

All email templates include:

- [x] Clear "From" name (Shopmatic)
- [x] Valid sender email (notifications@shopmatic.cc)
- [x] Physical postal address (add in footer)
- [x] Clear subject lines (no misleading subjects)
- [x] Unsubscribe link in every email
- [x] Honor unsubscribe requests within 10 business days
- [x] Transactional vs marketing email distinction

**ACTION REQUIRED:**
Add your physical business address to email templates in:
`/src/services/EmailService.ts` (footer section)

---

## 13. Support & Resources

- **NeonDB Docs:** https://neon.tech/docs
- **Emailit Docs:** https://emailit.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

---

## Quick Start Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

---

**Last Updated:** December 25, 2025
**Version:** 1.0.0

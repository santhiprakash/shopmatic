# Platform-Agnostic Deployment Guide

## Overview

eComJunction is designed to be deployed on any platform - Railway, Vercel, your own VPS, or any other hosting provider. This guide covers deployment strategies for maximum flexibility and easy migration.

---

## Architecture Principles

### 1. 12-Factor App Compliance
- Configuration via environment variables
- Stateless application design
- External service dependencies
- Portable codebase

### 2. Container-Ready
- Docker support for consistent deployment
- Docker Compose for local development
- Kubernetes-ready if needed

### 3. Database Agnostic
- PostgreSQL via standard connection string
- Works with any PostgreSQL provider (Neon, Supabase, AWS RDS, self-hosted)

### 4. Storage Agnostic
- S3-compatible API (works with Cloudflare R2, AWS S3, MinIO, etc.)
- Easy to swap storage providers

---

## Deployment Options

### Option 1: Railway (Recommended for Quick Start)

**Pros:**
- Easy setup
- Automatic deployments from Git
- Built-in PostgreSQL
- Reasonable pricing

**Cons:**
- Can get expensive at scale
- Less control than VPS

#### Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

#### Configuration

```bash
# Set environment variables
railway variables set VITE_AUTH0_DOMAIN=your-domain.auth0.com
railway variables set VITE_AUTH0_CLIENT_ID=your_client_id
railway variables set R2_ACCESS_KEY_ID=your_key
# ... etc
```

---

### Option 2: Vercel (Best for Frontend)

**Pros:**
- Excellent for Next.js/React
- Global CDN
- Automatic HTTPS
- Free tier available

**Cons:**
- Serverless functions have cold starts
- Need separate backend for long-running tasks

#### Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add R2_ACCESS_KEY_ID
# ... etc
```

#### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "DATABASE_URL": "@database_url",
    "R2_ACCESS_KEY_ID": "@r2_access_key_id"
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

---

### Option 3: Your Own VPS (Maximum Control)

**Pros:**
- Full control
- Predictable costs
- No vendor lock-in
- Can optimize for your needs

**Cons:**
- More setup required
- You manage everything
- Need DevOps knowledge

#### Requirements

- Ubuntu 22.04 LTS (or similar)
- 2GB RAM minimum (4GB recommended)
- 20GB storage minimum
- Node.js 18+
- PostgreSQL 15+
- Nginx
- SSL certificate (Let's Encrypt)

#### Setup Script

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/ecomjunction
sudo chown $USER:$USER /var/www/ecomjunction

# Clone repository
cd /var/www/ecomjunction
git clone https://github.com/yourusername/ecomjunction.git .

# Install dependencies
npm install

# Build application
npm run build

# Set up PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE ecomjunction;
CREATE USER ecomjunction WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecomjunction TO ecomjunction;
EOF

# Run migrations
DATABASE_URL="postgresql://ecomjunction:your_password@localhost/ecomjunction" \
  npm run migrate

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://ecomjunction:your_password@localhost/ecomjunction
DATABASE_POOLED_URL=postgresql://ecomjunction:your_password@localhost/ecomjunction
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
# ... other variables
EOF

# Start with PM2
pm2 start npm --name "ecomjunction" -- start
pm2 save
pm2 startup

# Configure Nginx
sudo tee /etc/nginx/sites-available/ecomjunction << EOF
server {
    listen 80;
    server_name ecomjunction.com www.ecomjunction.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/ecomjunction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d ecomjunction.com -d www.ecomjunction.com

echo "Deployment complete!"
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ecomjunction
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ecomjunction
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Update
git pull
docker-compose build
docker-compose up -d
```

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOLED_URL=postgresql://user:password@host:5432/database?pgbouncer=true

# Auth0
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.ecomjunction.com
AUTH0_CLIENT_SECRET=your_client_secret

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=ecomjunction-production
R2_PUBLIC_URL=https://cdn.ecomjunction.com

# OpenAI
VITE_OPENAI_API_KEY=your_openai_key

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# PayPal (International)
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live

# Application
VITE_APP_URL=https://ecomjunction.com
NODE_ENV=production
PORT=8080
```

---

## Migration Between Platforms

### Export Data

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Export environment variables
env | grep -E "DATABASE_URL|AUTH0|R2|STRIPE" > .env.backup

# Export uploaded files (if using local storage)
tar -czf uploads.tar.gz uploads/
```

### Import to New Platform

```bash
# Import database
psql $NEW_DATABASE_URL < backup.sql

# Set environment variables
cat .env.backup | while read line; do
  railway variables set $line  # or vercel env add, etc.
done

# Import files to R2
aws s3 sync uploads/ s3://your-bucket/ --endpoint-url https://...
```

---

## Monitoring & Logging

### Application Monitoring

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export function captureError(error: Error, context?: any) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error') {
  Sentry.captureMessage(message, level);
}
```

### Health Check Endpoint

```typescript
// api/health.ts
export async function GET() {
  try {
    // Check database
    await db.query('SELECT 1');
    
    // Check R2
    await storage.listFiles();
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        storage: 'up',
      },
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 500 });
  }
}
```

### Logging

```typescript
// src/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

## Performance Optimization

### Caching

```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch and cache
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### CDN Configuration

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    proxy_pass http://localhost:8080;
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    add_header X-Cache-Status $upstream_cache_status;
}
```

---

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Upload to R2
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz \
  s3://ecomjunction-backups/db_$DATE.sql.gz \
  --endpoint-url https://...

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Enable firewall (UFW on Ubuntu)
- [ ] Keep system updated
- [ ] Use strong database passwords
- [ ] Enable database SSL
- [ ] Set up fail2ban
- [ ] Regular security audits
- [ ] Monitor logs for suspicious activity
- [ ] Use secrets management (Vault, AWS Secrets Manager)

---

## Cost Comparison

### Railway
- **Starter:** $5/month + usage
- **Pro:** $20/month + usage
- **Estimated:** $30-50/month for small app

### Vercel
- **Hobby:** Free (limited)
- **Pro:** $20/month + usage
- **Estimated:** $20-40/month for small app

### VPS (DigitalOcean, Linode, Vultr)
- **Basic:** $6-12/month (2GB RAM)
- **Standard:** $12-24/month (4GB RAM)
- **Estimated:** $15-30/month total (including database)

### AWS/GCP/Azure
- **Variable pricing**
- **Estimated:** $50-200/month (depends on usage)

---

## Deployment Checklist

- [ ] Choose deployment platform
- [ ] Set up database (Neon DB or self-hosted PostgreSQL)
- [ ] Configure environment variables
- [ ] Set up Cloudflare R2 for storage
- [ ] Configure Auth0
- [ ] Set up domain and SSL
- [ ] Configure CDN (Cloudflare)
- [ ] Set up monitoring (Sentry)
- [ ] Configure logging
- [ ] Set up automated backups
- [ ] Test deployment
- [ ] Set up CI/CD
- [ ] Document deployment process

---

**Recommendation:** Start with Railway or Vercel for quick deployment, migrate to VPS when you need more control or want to reduce costs.

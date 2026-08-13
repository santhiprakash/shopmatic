# Neon DB Setup Guide

## Overview

Shopmatic uses Neon DB as its PostgreSQL database provider. Neon provides serverless PostgreSQL with automatic scaling, branching, and built-in connection pooling.

---

## 1. Create Neon Account and Project

### Step 1: Sign Up
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub, Google, or email
3. Verify your email if required

### Step 2: Create a New Project
1. Click "Create Project" in the Neon dashboard
2. Configure your project:
   - **Project Name:** shopmatic-production (or your preferred name)
   - **Region:** Choose closest to your users (e.g., US East, EU West, Asia Pacific)
   - **PostgreSQL Version:** 16 (recommended) or 15
   - **Compute Size:** Start with 0.25 vCPU (can scale later)

3. Click "Create Project"

### Step 3: Get Connection Details
After project creation, you'll see:
- **Connection String:** `postgresql://[user]:[password]@[host]/[database]`
- **Host:** Your Neon database host (e.g., `ep-xxx.us-east-2.aws.neon.tech`)
- **Database:** Default is `neondb`
- **User:** Default is your project name
- **Password:** Auto-generated (save this securely!)

---

## 2. Environment Configuration

### Update .env.local

Create or update your `.env.local` file:

```env
# Neon Database Configuration
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# For connection pooling (recommended for serverless)
DATABASE_POOLED_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true

# Application Settings
VITE_APP_NAME=Shopmatic
VITE_APP_URL=http://localhost:8080

# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Environment
VITE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ADVANCED_FEATURES=false
```

### Production Environment Variables

For production deployment (Vercel, Netlify, etc.), set these environment variables:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
DATABASE_POOLED_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true
```

---

## 3. Database Schema Setup

### Option A: Using Neon Console (Recommended for First Setup)

1. Go to your Neon project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration
6. Verify tables are created in the "Tables" tab

### Option B: Using Migration Tool

Install a PostgreSQL migration tool like `node-pg-migrate` or `prisma`:

```bash
# Install node-pg-migrate
npm install -g node-pg-migrate

# Run migration
node-pg-migrate up --database-url-var DATABASE_URL
```

### Option C: Using psql CLI

```bash
# Install PostgreSQL client if not already installed
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql-client

# Connect to Neon database
psql "postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Run migration file
\i migrations/001_initial_schema.sql

# Verify tables
\dt

# Exit
\q
```

---

## 4. Database Client Setup

### Install Dependencies

```bash
npm install @neondatabase/serverless
npm install -D @types/pg
```

### Create Database Client

Create `src/lib/neon.ts`:

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';

// Enable connection pooling for better performance
neonConfig.fetchConnectionCache = true;

// Get database URL from environment
const databaseUrl = import.meta.env.DATABASE_POOLED_URL || import.meta.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or DATABASE_POOLED_URL must be set');
}

// Create SQL client
export const sql = neon(databaseUrl);

// Database helper functions
export const db = {
  // Execute a query
  query: async (text: string, params?: any[]) => {
    return await sql(text, params);
  },

  // Get a single row
  queryOne: async (text: string, params?: any[]) => {
    const result = await sql(text, params);
    return result[0] || null;
  },

  // Transaction helper
  transaction: async (callback: (sql: typeof sql) => Promise<void>) => {
    // Neon handles transactions automatically
    await callback(sql);
  }
};

// Type-safe query builder (optional, for better DX)
export interface User {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  social_links: Record<string, any> | null;
  theme_settings: Record<string, any> | null;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  affiliate_url: string;
  original_url: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[];
  commission_rate: number | null;
  rating: number | null;
  platform: string | null;
  affiliate_id_used: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AffiliateId {
  id: string;
  user_id: string;
  platform: string;
  affiliate_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
}

export interface Analytics {
  id: string;
  product_id: string;
  user_id: string;
  event_type: 'view' | 'click' | 'conversion';
  visitor_ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: Date;
}
```

---

## 5. Authentication Setup

Auth lives on the **Express API** (`server/src/routes/auth.ts`), not in the Vite app.

Put the secret only in `server/.env` (or the host env for the API process):

```env
JWT_SECRET=use-openssl-rand-base64-32
```

**Do not** put `JWT_SECRET` in a `VITE_*` variable. Anything prefixed `VITE_` is baked into the browser bundle.

The frontend talks to `/api/auth/*` and `/api/users/*`. Username (public handle) is stored on `users.username` and updated via `PATCH /api/users/:id`.

### Install Authentication Dependencies

These belong in `server/`, not the frontend:

```bash
cd server
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### Historical note

An earlier draft of this page showed a client-side `src/lib/auth.ts` that read `import.meta.env.VITE_JWT_SECRET`. That pattern is wrong and must not be copied. Use `server/src/routes/auth.ts` and `process.env.JWT_SECRET`.

---

## 6. Additional Database Tables for Authentication

Add these tables to your migration:

```sql
-- Create user_passwords table for storing password hashes
CREATE TABLE user_passwords (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create password_resets table for password reset tokens
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_verifications table
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
```

---

## 7. Neon Features and Best Practices

### Connection Pooling
Always use the pooled connection URL for better performance:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true
```

### Branching (Development/Staging)
Neon supports database branching for development:

1. Go to your project dashboard
2. Click "Branches" in the sidebar
3. Click "Create Branch"
4. Name it (e.g., `development`, `staging`)
5. Use the branch-specific connection string for that environment

### Auto-Scaling
Neon automatically scales compute resources based on load. Configure in project settings:
- **Autosuspend:** Automatically suspend after inactivity (default: 5 minutes)
- **Compute Size:** Set min/max vCPU limits

### Monitoring
Monitor your database in the Neon dashboard:
- **Metrics:** CPU, memory, connections, query performance
- **Query Insights:** Slow query detection
- **Connection Stats:** Active connections, pool usage

---

## 8. Testing the Setup

### Test Database Connection

Create `scripts/test-db.ts`:

```typescript
import { sql } from '../src/lib/neon';

async function testConnection() {
  try {
    console.log('Testing Neon DB connection...');
    
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    console.log('Current time:', result[0].current_time);
    
    // Test tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📊 Tables in database:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run the test:
```bash
npx tsx scripts/test-db.ts
```

---

## 9. Migration from Supabase

If you're migrating from Supabase:

1. **Export Supabase Data:**
   ```bash
   # Use Supabase CLI
   supabase db dump -f backup.sql
   ```

2. **Import to Neon:**
   ```bash
   psql "postgresql://[user]:[password]@[host]/[database]?sslmode=require" < backup.sql
   ```

3. **Update Application Code:**
   - Replace `@supabase/supabase-js` with `@neondatabase/serverless`
   - Update authentication logic to use custom JWT auth
   - Update all database queries to use Neon client

---

## 10. Troubleshooting

### Common Issues

**Connection Timeout:**
- Check your connection string is correct
- Ensure `sslmode=require` is in the connection string
- Verify your IP is not blocked (Neon allows all IPs by default)

**Too Many Connections:**
- Use the pooled connection URL with `pgbouncer=true`
- Reduce connection pool size in your application

**Slow Queries:**
- Check query performance in Neon dashboard
- Add appropriate indexes
- Use EXPLAIN ANALYZE to debug queries

**Authentication Errors:**
- Verify JWT_SECRET is set correctly
- Check token expiration
- Ensure password hashing is working

---

## 11. Production Checklist

- [ ] Use strong JWT_SECRET (generate with `openssl rand -base64 32`)
- [ ] Enable connection pooling
- [ ] Set up database branching for staging
- [ ] Configure auto-suspend for cost optimization
- [ ] Set up monitoring and alerts
- [ ] Enable query insights
- [ ] Configure backup retention
- [ ] Test failover and recovery
- [ ] Document connection strings securely
- [ ] Set up CI/CD with database migrations

---

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)

---

**Support:** For issues, check the Neon community forum or create an issue in the repository.

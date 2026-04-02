---
description: Neon Postgres database operations and branching workflows
---

# Neon Database Operations

This skill covers common Neon Postgres database operations including branching, migrations, and management.

## Prerequisites

1. Neon account with project created
2. `NEON_API_KEY` environment variable set
3. Connection string available

## Connection String Format

```
postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
```

## Common Operations

### Create Database Branch

Neon branches are instant copies of your database - perfect for development and testing.

```bash
# Using Neon CLI
npx neonctl branches create --name dev-feature-x

# Get connection string for branch
npx neonctl connection-string dev-feature-x
```

### Run Migrations

```bash
# Using Drizzle ORM
npx drizzle-kit push:pg

# Using Prisma
npx prisma migrate dev

# Using raw SQL
psql $DATABASE_URL -f migrations/001_initial.sql
```

### Reset Branch to Main

```bash
# Delete and recreate branch from main
npx neonctl branches delete dev-feature-x
npx neonctl branches create --name dev-feature-x --parent main
```

### List Branches

```bash
npx neonctl branches list
```

## Schema Patterns

### Initial Schema Setup

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (compatible with Auth0)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Index Best Practices

```sql
-- Index for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);

-- Partial index for active records
CREATE INDEX idx_active_users ON users(id) WHERE deleted_at IS NULL;
```

## Connection Pooling

For serverless environments (Vercel, Firebase Functions), use Neon's connection pooler:

```typescript
// Use pooled connection for serverless
const pooledUrl = process.env.DATABASE_URL.replace(
  '.neon.tech',
  '-pooler.neon.tech'
);
```

## Drizzle ORM Setup

```typescript
// db/schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  auth0Id: varchar('auth0_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

## Tips

- Always use branches for development/testing
- Reset branches regularly to avoid schema drift
- Use connection pooling in serverless environments
- Enable query logging during development

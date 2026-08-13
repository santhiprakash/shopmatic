# Shopmatic Migration Scripts

Migration scripts to migrate Shopmatic from localStorage to Neon PostgreSQL database.

## Overview

This directory contains all necessary scripts and documentation for migrating user data from the browser's localStorage to a Neon PostgreSQL database.

## Files

1. **01_neon_schema.sql** - Complete database schema for Neon
2. **02_export_localstorage.js** - Browser console script to export localStorage data
3. **03_transform_data.ts** - Node.js script to transform exported data
4. **04_import_to_neon.ts** - Node.js script to import data into Neon
5. **package.json** - Dependencies for migration scripts
6. **README.md** - This file

## Prerequisites

### 1. Neon Database Setup

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Create a `.env` file in this directory:

```bash
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 2. Run Database Schema

Connect to your Neon database and run the schema:

```bash
psql $NEON_DATABASE_URL -f 01_neon_schema.sql
```

Or use the Neon SQL Editor in the web console.

### 3. Install Dependencies

```bash
cd scripts/migration
npm install
```

## Migration Process

### Step 1: Export localStorage Data

1. Open Shopmatic in your browser
2. Open Developer Console (F12 or Cmd+Option+I)
3. Copy the contents of `02_export_localstorage.js`
4. Paste into the console and press Enter
5. A JSON file will be downloaded (e.g., `shopmatic-export-2025-12-22.json`)

### Step 2: Transform Data

Transform the exported data to Neon-compatible format:

```bash
npx ts-node 03_transform_data.ts <export-file.json> <user-email> [user-name]
```

**Example:**
```bash
npx ts-node 03_transform_data.ts shopmatic-export-2025-12-22.json user@example.com "John Doe"
```

**Output:**
- Creates `transformed-shopmatic-export-2025-12-22.json`
- Includes user profile, products, and categories

### Step 3: Import to Neon

Import the transformed data into Neon database:

```bash
npx ts-node 04_import_to_neon.ts <transformed-file.json> --password <user-password>
```

**Example:**
```bash
npx ts-node 04_import_to_neon.ts transformed-export.json --password SecurePass123
```

**Notes:**
- If `--password` is not provided, default password `changeme123` will be used
- User should change password after first login

### Step 4: Verify Migration

1. Login to the application with the new credentials
2. Verify all products are present
3. Check theme settings are applied
4. Verify categories are correct

## Data Mapping

### localStorage → Neon

| localStorage Key | Neon Table | Notes |
|-----------------|------------|-------|
| `shopmatic-products` | `products` | All products with user_id |
| `shopmatic-theme` | `users.theme_settings` | JSONB column |
| `shopmatic_auth` | `users` | New user account created |
| Categories (extracted) | `categories` | Unique categories from products |

## Security Notes

1. **Passwords**: All passwords are hashed using bcrypt
2. **API Keys**: Not migrated - users must re-enter
3. **Sessions**: New sessions created on login
4. **Encryption**: Database uses TLS/SSL for all connections

## Troubleshooting

### Error: "NEON_DATABASE_URL not set"

**Solution:** Create a `.env` file with your Neon connection string

### Error: "Failed to parse export file"

**Solution:** Ensure the export file is valid JSON. Try exporting again.

### Error: "User already exists"

**Solution:** The script uses `ON CONFLICT` to update existing users. Data will be merged.

### Products not showing

**Solution:** Check that:
1. User ID matches in all tables
2. `is_active` is true
3. Category IDs are correctly assigned

## Rollback

If migration fails or has issues:

1. **Keep localStorage backup**: Original data is never deleted
2. **Database backup**: Neon provides automatic backups
3. **Re-export**: Run export script again to get fresh data
4. **Manual cleanup**: Delete user and related data:

```sql
DELETE FROM users WHERE email = 'user@example.com';
-- Cascade will delete all related products, categories, etc.
```

## Support

For issues with migration scripts:
1. Check the console output for detailed error messages
2. Verify database schema is correctly applied
3. Ensure all dependencies are installed
4. Check Neon database connection

## Migration Timeline

**Estimated time per user:**
- Export: 1 minute
- Transform: < 1 second
- Import: 1-5 minutes (depending on product count)

**Total per user:** ~5-10 minutes including verification

## Batch Migration

To migrate multiple users:

```bash
# Create a batch script
#!/bin/bash

for export_file in exports/*.json; do
  email=$(jq -r '.data.auth.user.email' "$export_file")
  name=$(jq -r '.data.auth.user.name' "$export_file")

  echo "Migrating $email..."

  npx ts-node 03_transform_data.ts "$export_file" "$email" "$name"

  transformed="transformed-$(basename $export_file)"
  npx ts-node 04_import_to_neon.ts "$transformed" --password "ChangeMe123"

  echo "✅ Completed $email"
  echo "---"
done
```

## Post-Migration Cleanup

After successful migration:

1. **Update frontend** to use API instead of localStorage
2. **Clear localStorage** (optional - can keep as backup)
3. **Notify users** to login with new credentials
4. **Monitor** for any data issues
5. **Backup** Neon database

## Schema Version

Current schema version: **1.0**
Compatible with: Shopmatic v0.0.0+

## Changes from Supabase Schema

Main differences from the original Supabase migration:

1. ✅ Added `api_keys` table for encrypted API key storage
2. ✅ Added more indexes for performance
3. ✅ Added helper functions for business logic
4. ✅ Added views for common queries
5. ✅ Enhanced analytics with device tracking
6. ✅ Added session management table
7. ✅ Added subscription management fields

## License

Internal use only - Shopmatic Migration Scripts

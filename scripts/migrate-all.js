#!/usr/bin/env node

/**
 * Database Migration Script - Runs all migrations in order
 * 
 * Usage:
 *   node scripts/migrate-all.js
 *   OR
 *   DATABASE_URL="your-url" node scripts/migrate-all.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

const migrations = [
  '001_initial_schema_neon.sql',
  '002_add_smtp_settings.sql',
  '003_add_pages_and_roles.sql',
  '004_add_collaboration_system.sql',
];

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migrations...\n');
    
    for (const migrationFile of migrations) {
      console.log(`📝 Running migration: ${migrationFile}`);
      
      const migrationPath = join(__dirname, '..', 'migrations', migrationFile);
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      try {
        await client.query(migrationSQL);
        console.log(`   ✅ ${migrationFile} completed`);
      } catch (error) {
        if (error.code === '42P07' || error.code === '42710') {
          console.log(`   ⚠️  ${migrationFile} - tables already exist (skipping)`);
        } else if (error.code === '23505') {
          console.log(`   ⚠️  ${migrationFile} - data already exists (skipping)`);
        } else if (error.message.includes('duplicate')) {
          console.log(`   ⚠️  ${migrationFile} - duplicates found (skipping)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n📊 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n✅ Found ${result.rows.length} tables:`);
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n🎉 All database migrations complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs the NeonDB schema migration
 * 
 * Usage:
 *   node scripts/migrate-db.js
 *   OR
 *   DATABASE_URL="your-url" node scripts/migrate-db.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Prefer DATABASE_URL. VITE_NEON_DATABASE_URL is a legacy fallback for old local setups only.
const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL or VITE_NEON_DATABASE_URL environment variable is required');
  console.error('\nPlease set it in your .env file or export it:');
  console.error('  export DATABASE_URL="postgresql://user:password@host/database?sslmode=require"');
  process.exit(1);
}

// Create connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    console.log('📝 Reading migration file...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'migrations', '001_initial_schema_neon.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('✅ Migration file loaded');
    console.log('🚀 Executing migration...');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
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
    
    // Expected tables
    const expectedTables = [
      'users',
      'user_passwords',
      'password_resets',
      'email_verifications',
      'user_sessions',
      'products',
      'categories',
      'analytics',
      'affiliate_ids',
    ];
    
    const createdTables = result.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !createdTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn(`\n⚠️  Warning: Some expected tables are missing: ${missingTables.join(', ')}`);
    } else {
      console.log('\n✅ All expected tables are present!');
    }
    
    console.log('\n🎉 Database migration complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.error('\n⚠️  Note: Some tables may already exist. This is okay if you\'re re-running the migration.');
      console.error('   If you need a fresh start, drop the existing tables first.');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});


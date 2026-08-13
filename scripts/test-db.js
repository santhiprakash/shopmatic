#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the connection to NeonDB and verifies tables exist
 * 
 * Usage:
 *   node scripts/test-db.js
 *   OR
 *   DATABASE_URL="your-url" node scripts/test-db.js
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
  process.exit(1);
}

// Create connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

async function testConnection() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Testing database connection...\n');
    
    // Test basic connection
    console.log('1️⃣  Testing basic connection...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ Connection successful!');
    console.log(`   📅 Server time: ${result.rows[0].current_time}`);
    console.log(`   🗄️  PostgreSQL version: ${result.rows[0].pg_version.split(',')[0]}\n`);
    
    // Check tables
    console.log('2️⃣  Checking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`   📊 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`      - ${table}`);
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
    
    console.log('\n3️⃣  Verifying required tables...');
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('   💡 Run migration: npm run db:migrate\n');
    } else {
      console.log('   ✅ All required tables are present!\n');
    }
    
    // Test table structure
    if (tables.includes('users')) {
      console.log('4️⃣  Testing users table structure...');
      const usersColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      console.log(`   ✅ Users table has ${usersColumns.rows.length} columns`);
      console.log(`      Key columns: ${usersColumns.rows.slice(0, 5).map(r => r.column_name).join(', ')}...`);
    }
    
    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Tip: Check that your database hostname is correct');
    } else if (error.code === '28P01') {
      console.error('\n💡 Tip: Check that your username and password are correct');
    } else if (error.code === '3D000') {
      console.error('\n💡 Tip: Check that your database name is correct');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testConnection().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});


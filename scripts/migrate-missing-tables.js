#!/usr/bin/env node

/**
 * Safe Migration Script - Creates only missing tables
 * This script checks which tables exist and creates only the missing ones
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Prefer DATABASE_URL. VITE_NEON_DATABASE_URL is a legacy fallback for old local setups only.
const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL or VITE_NEON_DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

// Tables that should exist
const requiredTables = [
  'user_passwords',
  'password_resets',
  'email_verifications',
  'user_sessions',
];

// SQL statements for missing tables
const tableSQL = {
  user_passwords: `
    CREATE TABLE IF NOT EXISTS user_passwords (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  password_resets: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
    CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
    CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
  `,
  email_verifications: `
    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
    CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
  `,
  user_sessions: `
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
  `,
};

async function migrateMissingTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Checking existing tables...\n');
    
    // Check which tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const existingTables = result.rows.map(row => row.table_name);
    console.log(`📊 Found ${existingTables.length} existing tables\n`);
    
    // Ensure UUID extension exists
    console.log('🔧 Ensuring UUID extension exists...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('   ✅ UUID extension ready\n');
    
    // Create missing tables
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables already exist!');
      return;
    }
    
    console.log(`📝 Creating ${missingTables.length} missing table(s): ${missingTables.join(', ')}\n`);
    
    for (const table of missingTables) {
      console.log(`   Creating table: ${table}...`);
      await client.query(tableSQL[table]);
      console.log(`   ✅ ${table} created\n`);
    }
    
    // Create triggers if they don't exist
    console.log('🔧 Creating triggers...');
    
    // Update trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Trigger for user_passwords if table exists
    if (existingTables.includes('user_passwords') || missingTables.includes('user_passwords')) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_user_passwords_updated_at ON user_passwords;
        CREATE TRIGGER update_user_passwords_updated_at 
          BEFORE UPDATE ON user_passwords
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    
    console.log('   ✅ Triggers created\n');
    
    // Verify all tables now exist
    const verifyResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN (${requiredTables.map((_, i) => `$${i + 1}`).join(', ')})
    `, requiredTables);
    
    const verifiedTables = verifyResult.rows.map(row => row.table_name);
    const stillMissing = requiredTables.filter(table => !verifiedTables.includes(table));
    
    if (stillMissing.length > 0) {
      console.warn(`⚠️  Warning: These tables are still missing: ${stillMissing.join(', ')}`);
    } else {
      console.log('✅ All required tables are now present!\n');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateMissingTables().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});


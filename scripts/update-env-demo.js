#!/usr/bin/env node

/**
 * Update .env file with demo/test credentials
 * This script adds missing environment variables with demo values
 */

import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';

// Generate a secure random JWT secret (server-side only)
const generateJWTSecret = () => {
  return randomBytes(32).toString('base64');
};

// Load current .env
config();

const envPath = '.env';
let envContent = '';

try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('Creating new .env file...');
  envContent = '';
}

// Check what's missing and what needs updating
const updates = [];
const jwtSecret = generateJWTSecret();

// JWT belongs on the server only. Never write VITE_JWT_SECRET.
const hasServerJwt = /(^|\n)JWT_SECRET=/m.test(envContent);
if (!hasServerJwt) {
  envContent += `\n# Security (server only — do not prefix with VITE_)\nJWT_SECRET=${jwtSecret}\n`;
  updates.push('Added JWT_SECRET');
}

// Add placeholder comments for missing R2 credentials
if (!envContent.includes('R2_ACCOUNT_ID=')) {
  envContent += `\n# ============================================\n# CLOUDFLARE R2 (Storage) - PENDING FROM USER\n# ============================================\n# R2_ACCOUNT_ID=your_account_id_here\n# R2_ACCESS_KEY_ID=your_access_key_id_here\n# R2_SECRET_ACCESS_KEY=your_secret_access_key_here\n# R2_BUCKET_NAME=your_bucket_name_here\n# R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com/your-bucket-name\n`;
  updates.push('Added R2 configuration placeholders');
}

// Check Emailit API key
if (envContent.includes('EMAILIT_API_KEY=') && (envContent.includes('EMAILIT_API_KEY=\n') || envContent.includes('EMAILIT_API_KEY=\r'))) {
  envContent = envContent.replace(/EMAILIT_API_KEY=\s*\n/g, 'EMAILIT_API_KEY=\n# EMAILIT_API_KEY=your_emailit_api_key_here\n');
  updates.push('Noted Emailit API key is pending');
}

// Write back
writeFileSync(envPath, envContent);

if (updates.length > 0) {
  console.log('✅ Updated .env file:');
  updates.forEach(update => console.log(`   - ${update}`));
  console.log(`\n🔐 Generated JWT Secret: ${jwtSecret.substring(0, 20)}...`);
  console.log('\n⚠️  Still need from you:');
  console.log('   - R2 credentials (Account ID, Access Key ID, Secret Access Key, Bucket Name)');
  console.log('   - Emailit API key');
} else {
  console.log('✅ .env file is already up to date');
}

/**
 * Import to Neon Database Script
 *
 * Imports transformed data into Neon PostgreSQL database
 *
 * Prerequisites:
 *   - Neon database created
 *   - Schema migration (01_neon_schema.sql) applied
 *   - NEON_DATABASE_URL environment variable set
 *
 * Usage:
 *   npx ts-node 04_import_to_neon.ts <transformed-file.json> [--password <password>]
 *
 * Example:
 *   npx ts-node 04_import_to_neon.ts transformed-export.json --password securepass123
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================
// INTERFACES
// ============================================

interface TransformedUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name?: string;
  theme_settings: any;
  subscription_plan: string;
  created_at: string;
}

interface TransformedProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  affiliate_url: string;
  original_url: string;
  image_url: string;
  category_id: string | null;
  tags: string[];
  rating: number | null;
  source: string;
  platform: string;
  extraction_method: string;
  is_active: boolean;
  created_at: string;
}

interface TransformedCategory {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface TransformedData {
  user: TransformedUser;
  products: TransformedProduct[];
  categories: TransformedCategory[];
}

// ============================================
// IMPORT FUNCTION
// ============================================

/**
 * Import transformed data to Neon database
 */
async function importToNeon(
  data: TransformedData,
  password: string
): Promise<void> {
  console.log('🚀 Starting Neon Database Import...\n');

  // Validate environment
  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('NEON_DATABASE_URL environment variable not set');
  }

  // Initialize Neon connection
  const sql = neon(databaseUrl);
  console.log('✅ Connected to Neon database\n');

  try {
    // Step 1: Create user
    console.log('1️⃣  Creating user account...');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await sql`
      INSERT INTO users (
        id, email, password_hash, username, first_name, last_name,
        theme_settings, subscription_plan, email_verified, created_at
      )
      VALUES (
        ${data.user.id},
        ${data.user.email},
        ${passwordHash},
        ${data.user.username},
        ${data.user.first_name},
        ${data.user.last_name || null},
        ${JSON.stringify(data.user.theme_settings)},
        ${data.user.subscription_plan},
        true,
        ${data.user.created_at}
      )
      ON CONFLICT (email) DO UPDATE
      SET
        theme_settings = ${JSON.stringify(data.user.theme_settings)},
        updated_at = NOW()
      RETURNING id, email;
    `;

    console.log(`   ✅ User created: ${userResult[0].email} (ID: ${userResult[0].id})\n`);

    // Step 2: Import categories
    console.log(`2️⃣  Importing ${data.categories.length} categories...`);

    for (const category of data.categories) {
      await sql`
        INSERT INTO categories (
          id, user_id, name, slug, color, sort_order, is_active
        )
        VALUES (
          ${category.id},
          ${category.user_id},
          ${category.name},
          ${category.slug},
          ${category.color},
          ${category.sort_order},
          ${category.is_active}
        )
        ON CONFLICT (user_id, name) DO NOTHING;
      `;
    }

    console.log('   ✅ Categories imported\n');

    // Step 3: Import products
    console.log(`3️⃣  Importing ${data.products.length} products...`);

    let imported = 0;
    let failed = 0;

    for (const product of data.products) {
      try {
        await sql`
          INSERT INTO products (
            id, user_id, title, description, price, currency,
            affiliate_url, original_url, image_url, category_id,
            tags, rating, source, platform, extraction_method,
            is_active, created_at
          )
          VALUES (
            ${product.id},
            ${product.user_id},
            ${product.title},
            ${product.description},
            ${product.price},
            ${product.currency},
            ${product.affiliate_url},
            ${product.original_url},
            ${product.image_url},
            ${product.category_id},
            ${product.tags},
            ${product.rating},
            ${product.source},
            ${product.platform},
            ${product.extraction_method},
            ${product.is_active},
            ${product.created_at}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        imported++;

        if (imported % 10 === 0) {
          console.log(`   Progress: ${imported}/${data.products.length}`);
        }
      } catch (error) {
        failed++;
        console.error(`   ⚠️  Failed to import product: ${product.title}`);
      }
    }

    console.log(`   ✅ Products imported: ${imported}`);
    if (failed > 0) {
      console.log(`   ⚠️  Failed: ${failed}\n`);
    } else {
      console.log('');
    }

    // Step 4: Verify import
    console.log('4️⃣  Verifying import...');

    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM products WHERE user_id = ${data.user.id}) as product_count,
        (SELECT COUNT(*) FROM categories WHERE user_id = ${data.user.id}) as category_count,
        (SELECT subscription_plan FROM users WHERE id = ${data.user.id}) as plan
    `;

    const productCount = Number(stats[0].product_count);
    const categoryCount = Number(stats[0].category_count);
    const plan = stats[0].plan;

    console.log('   ✅ Verification complete\n');

    // Step 5: Display summary
    console.log('==========================================');
    console.log('✅ Import Complete!\n');

    console.log('📊 Import Summary:');
    console.log(`   - User: ${data.user.email}`);
    console.log(`   - User ID: ${data.user.id}`);
    console.log(`   - Subscription: ${plan}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Theme: Imported\n`);

    // Category breakdown
    console.log('📋 Category Breakdown:');
    for (const category of data.categories) {
      const catProducts = data.products.filter(p => p.category_id === category.id);
      console.log(`   - ${category.name}: ${catProducts.length} products`);
    }

    console.log('\n✨ Next Steps:');
    console.log(`   1. User can login with:`);
    console.log(`      Email: ${data.user.email}`);
    console.log(`      Password: [the password you provided]`);
    console.log(`   2. All products and settings have been migrated`);
    console.log(`   3. User should verify their data in the application\n`);

  } catch (error) {
    console.error('\n❌ Import failed:');
    console.error(error);
    throw error;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🚀 Shopmatic Neon Database Import');
  console.log('==========================================\n');

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('❌ Error: Missing required arguments\n');
    console.log('Usage:');
    console.log('  npx ts-node 04_import_to_neon.ts <transformed-file.json> [--password <password>]\n');
    console.log('Example:');
    console.log('  npx ts-node 04_import_to_neon.ts transformed-export.json --password securepass123\n');
    console.log('Environment Variables:');
    console.log('  NEON_DATABASE_URL - Neon database connection string\n');
    process.exit(1);
  }

  const transformedFile = args[0];

  // Find password argument
  const passwordIndex = args.indexOf('--password');
  let password = 'changeme123'; // Default password

  if (passwordIndex !== -1 && args[passwordIndex + 1]) {
    password = args[passwordIndex + 1];
  } else {
    console.log('⚠️  No password provided, using default: changeme123');
    console.log('   User should change this after first login!\n');
  }

  // Validate transformed file exists
  if (!fs.existsSync(transformedFile)) {
    console.error(`❌ Error: Transformed file not found: ${transformedFile}\n`);
    process.exit(1);
  }

  console.log(`📂 Transformed file: ${transformedFile}`);
  console.log(`🔐 Password: ${'*'.repeat(password.length)}\n`);

  // Load transformed data
  let data: TransformedData;
  try {
    const fileContent = fs.readFileSync(transformedFile, 'utf-8');
    data = JSON.parse(fileContent);
    console.log(`✅ Loaded transformed data`);
    console.log(`   User: ${data.user.email}`);
    console.log(`   Products: ${data.products.length}`);
    console.log(`   Categories: ${data.categories.length}\n`);
  } catch (e) {
    console.error('❌ Error: Failed to parse transformed file');
    console.error(e);
    process.exit(1);
  }

  // Import to Neon
  try {
    await importToNeon(data, password);
  } catch (e) {
    console.error('\n❌ Import process failed');
    console.error(e);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

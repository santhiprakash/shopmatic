#!/usr/bin/env node

/**
 * Seed Demo Data Script
 * Adds demo products, analytics, and user data to the database
 * 
 * Usage:
 *   node scripts/seed-demo-data.js
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

// Load environment variables
config();

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

// Demo user ID (we'll create or use existing demo user)
const DEMO_USER_EMAIL = 'demo@shopmatic.cc';
const DEMO_USER_NAME = 'Demo User';

// Demo products data
const demoProducts = [
  {
    title: 'Apple AirPods Pro (2nd Generation)',
    description: 'Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio, MagSafe Charging Case, Bluetooth 5.3 Headphones',
    price: 249.99,
    currency: 'USD',
    affiliate_url: 'https://amazon.com/dp/B0BDHB9Y8H',
    original_url: 'https://amazon.com/dp/B0BDHB9Y8H',
    image_url: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
    category: 'Electronics',
    tags: ['Trending', 'Best Seller', 'Tech'],
    platform: 'amazon',
    rating: 4.7,
    commission_rate: 8.5,
  },
  {
    title: 'Nike Air Max 90',
    description: 'Classic sneakers with air cushioning technology for all-day comfort',
    price: 120.00,
    currency: 'USD',
    affiliate_url: 'https://nike.com/air-max-90',
    original_url: 'https://nike.com/air-max-90',
    image_url: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b2010e00e96c/air-max-90-shoes-9wjX0R.png',
    category: 'Fashion',
    tags: ['Trending', 'Premium'],
    platform: 'nike',
    rating: 4.5,
    commission_rate: 6.0,
  },
  {
    title: 'Instant Pot Duo 7-in-1',
    description: 'Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer & Sterilizer',
    price: 99.95,
    currency: 'USD',
    affiliate_url: 'https://amazon.com/dp/B00FLYWNYQ',
    original_url: 'https://amazon.com/dp/B00FLYWNYQ',
    image_url: 'https://m.media-amazon.com/images/I/71UlcjzQxDL._AC_SL1500_.jpg',
    category: 'Kitchen',
    tags: ['Best Seller', 'Home', 'Kitchen'],
    platform: 'amazon',
    rating: 4.8,
    commission_rate: 7.0,
  },
  {
    title: 'Fitbit Charge 5',
    description: 'Advanced fitness tracker with built-in GPS, stress management, and 24/7 heart rate',
    price: 179.95,
    currency: 'USD',
    affiliate_url: 'https://amazon.com/dp/B09BGGZB6K',
    original_url: 'https://amazon.com/dp/B09BGGZB6K',
    image_url: 'https://m.media-amazon.com/images/I/51fXWwGpBbL._AC_SL1000_.jpg',
    category: 'Fitness',
    tags: ['Trending', 'Tech', 'Fitness'],
    platform: 'amazon',
    rating: 4.4,
    commission_rate: 8.0,
  },
  {
    title: 'LEGO Star Wars Millennium Falcon',
    description: 'Iconic Star Wars spaceship building set with 7541 pieces',
    price: 849.99,
    currency: 'USD',
    affiliate_url: 'https://lego.com/product/millennium-falcon',
    original_url: 'https://lego.com/product/millennium-falcon',
    image_url: 'https://www.lego.com/cdn/cs/set/assets/blt0e5b9e8d5e9e5f5b/75192_alt1.png',
    category: 'Home & Garden',
    tags: ['Premium', 'New Arrival'],
    platform: 'lego',
    rating: 4.9,
    commission_rate: 5.0,
  },
  {
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with premium sound quality',
    price: 399.99,
    currency: 'USD',
    affiliate_url: 'https://amazon.com/dp/B09XS7JWHH',
    original_url: 'https://amazon.com/dp/B09XS7JWHH',
    image_url: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
    category: 'Electronics',
    tags: ['Premium', 'Tech'],
    platform: 'amazon',
    rating: 4.6,
    commission_rate: 9.0,
  },
  {
    title: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Laser detection technology reveals microscopic dust and deep cleans carpets',
    price: 749.99,
    currency: 'USD',
    affiliate_url: 'https://dyson.com/v15-detect',
    original_url: 'https://dyson.com/v15-detect',
    image_url: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/394295-01.png',
    category: 'Home & Garden',
    tags: ['Premium', 'Home'],
    platform: 'dyson',
    rating: 4.7,
    commission_rate: 7.5,
  },
  {
    title: 'The Ordinary Retinol 1% in Squalane',
    description: 'Anti-aging serum with 1% pure retinol for visible skin improvement',
    price: 9.80,
    currency: 'USD',
    affiliate_url: 'https://theordinary.com/retinol-1',
    original_url: 'https://theordinary.com/retinol-1',
    image_url: 'https://theordinary.com/product_images/retinol-1.jpg',
    category: 'Beauty',
    tags: ['Budget-Friendly', 'Eco-Friendly'],
    platform: 'theordinary',
    rating: 4.5,
    commission_rate: 10.0,
  },
];

async function seedDemoData() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting demo data seeding...\n');

    // Step 1: Create or get demo user
    console.log('1️⃣  Creating/getting demo user...');
    let userId;
    
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_USER_EMAIL]);
    
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log(`   ✅ Demo user already exists (ID: ${userId.substring(0, 8)}...)`);
    } else {
      // Create demo user
      const userResult = await client.query(`
        INSERT INTO users (id, email, username, first_name, last_name, is_active, email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id
      `, [
        randomUUID(),
        DEMO_USER_EMAIL,
        'demo',
        'Demo',
        'User',
        true,
        true,
      ]);
      userId = userResult.rows[0].id;
      console.log(`   ✅ Created demo user (ID: ${userId.substring(0, 8)}...)`);
    }
    console.log('');

    // Step 2: Add categories
    console.log('2️⃣  Creating categories...');
    const categories = ['Electronics', 'Fashion', 'Kitchen', 'Fitness', 'Home & Garden', 'Beauty'];
    const categoryMap = {};
    
    for (const catName of categories) {
      // Check if category exists
      const catCheck = await client.query(
        'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
        [userId, catName]
      );
      
      if (catCheck.rows.length > 0) {
        categoryMap[catName] = catCheck.rows[0].id;
      } else {
        const catResult = await client.query(`
          INSERT INTO categories (id, user_id, name, created_at)
          VALUES ($1, $2, $3, NOW())
          RETURNING id
        `, [randomUUID(), userId, catName]);
        categoryMap[catName] = catResult.rows[0].id;
      }
    }
    console.log(`   ✅ Created ${categories.length} categories\n`);

    // Step 3: Add demo products
    console.log('3️⃣  Adding demo products...');
    let productsAdded = 0;
    
    for (const product of demoProducts) {
      // Check if product already exists (by title and user)
      const existing = await client.query(
        'SELECT id FROM products WHERE user_id = $1 AND title = $2',
        [userId, product.title]
      );
      
      if (existing.rows.length === 0) {
        const categoryId = categoryMap[product.category] || null;
        
        await client.query(`
          INSERT INTO products (
            id, user_id, title, description, price, currency,
            affiliate_url, original_url, image_url, category,
            tags, platform, rating, commission_rate,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        `, [
          randomUUID(),
          userId,
          product.title,
          product.description,
          product.price,
          product.currency,
          product.affiliate_url,
          product.original_url,
          product.image_url,
          product.category,
          product.tags,
          product.platform,
          product.rating,
          product.commission_rate,
          true,
        ]);
        productsAdded++;
      }
    }
    console.log(`   ✅ Added ${productsAdded} new products (${demoProducts.length - productsAdded} already existed)\n`);

    // Step 4: Get product IDs for analytics
    const productsResult = await client.query(
      'SELECT id, title FROM products WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    const productIds = productsResult.rows.map(row => row.id);
    
    if (productIds.length === 0) {
      console.log('   ⚠️  No products found to add analytics for');
      return;
    }

    // Step 5: Add demo analytics data
    console.log('4️⃣  Adding demo analytics data...');
    let analyticsAdded = 0;
    
    // Add view events (last 30 days)
    for (let i = 0; i < 200; i++) {
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      await client.query(`
        INSERT INTO analytics (id, product_id, user_id, event_type, created_at)
        VALUES ($1, $2, $3, 'view', $4)
      `, [randomUUID(), productId, userId, createdAt]);
      analyticsAdded++;
    }
    
    // Add click events (last 30 days)
    for (let i = 0; i < 50; i++) {
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      await client.query(`
        INSERT INTO analytics (id, product_id, user_id, event_type, created_at)
        VALUES ($1, $2, $3, 'click', $4)
      `, [randomUUID(), productId, userId, createdAt]);
      analyticsAdded++;
    }
    
    // Add conversion events (last 30 days)
    for (let i = 0; i < 15; i++) {
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      await client.query(`
        INSERT INTO analytics (id, product_id, user_id, event_type, created_at)
        VALUES ($1, $2, $3, 'conversion', $4)
      `, [randomUUID(), productId, userId, createdAt]);
      analyticsAdded++;
    }
    
    console.log(`   ✅ Added ${analyticsAdded} analytics events\n`);

    // Summary
    console.log('✅ Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   User: ${DEMO_USER_EMAIL}`);
    console.log(`   Products: ${productsAdded} new products added`);
    console.log(`   Analytics: ${analyticsAdded} events added`);
    console.log(`   Categories: ${categories.length} categories created\n`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedDemoData().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});


/**
 * Transform Data Script
 *
 * Transforms exported localStorage data into Neon database format
 *
 * Usage:
 *   npx ts-node 03_transform_data.ts <export-file.json> <user-email> [user-name]
 *
 * Example:
 *   npx ts-node 03_transform_data.ts shopmatic-export-2025-12-22.json user@example.com "John Doe"
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// INTERFACES
// ============================================

interface LocalStorageExport {
  version: string;
  exportDate: string;
  source: string;
  data: {
    products: any[];
    theme: any;
    auth: any;
    apiKeys: any;
    cookiePreferences: any;
  };
}

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
// TRANSFORMATION FUNCTIONS
// ============================================

/**
 * Transform exported data to Neon-compatible format
 */
function transformData(
  exportData: LocalStorageExport,
  userEmail: string,
  userName: string
): TransformedData {
  console.log('🔄 Transforming data...\n');

  const userId = uuidv4();
  const [firstName, ...lastNameParts] = userName.split(' ');
  const lastName = lastNameParts.join(' ') || undefined;

  // Extract unique categories from products
  const categorySet = new Set<string>();
  exportData.data.products.forEach(product => {
    if (product.categories && Array.isArray(product.categories)) {
      product.categories.forEach((cat: string) => categorySet.add(cat));
    }
  });

  // Create category objects
  const categories: TransformedCategory[] = Array.from(categorySet).map((name, index) => ({
    id: uuidv4(),
    user_id: userId,
    name,
    slug: slugify(name),
    color: getColorForCategory(index),
    sort_order: index,
    is_active: true
  }));

  console.log(`✅ Created ${categories.length} categories`);

  // Create category lookup map
  const categoryMap = new Map<string, string>();
  categories.forEach(cat => categoryMap.set(cat.name, cat.id));

  // Transform products
  const products: TransformedProduct[] = exportData.data.products.map(product => {
    // Find category ID from first category
    const categoryName = product.categories?.[0];
    const categoryId = categoryName ? categoryMap.get(categoryName) || null : null;

    return {
      id: product.id || uuidv4(),
      user_id: userId,
      title: product.title,
      description: product.description || '',
      price: product.price || 0,
      currency: product.currency || 'USD',
      affiliate_url: product.link || product.affiliate_url,
      original_url: extractOriginalUrl(product.link || product.affiliate_url),
      image_url: product.image || product.image_url || '',
      category_id: categoryId,
      tags: product.tags || [],
      rating: product.rating || null,
      source: product.source || 'Other',
      platform: detectPlatform(product.link || product.affiliate_url),
      extraction_method: 'manual', // All localStorage products are manual
      is_active: true,
      created_at: product.createdAt || new Date().toISOString()
    };
  });

  console.log(`✅ Transformed ${products.length} products`);

  // Create user object
  const user: TransformedUser = {
    id: userId,
    email: userEmail,
    username: userEmail.split('@')[0],
    first_name: firstName,
    last_name: lastName,
    theme_settings: exportData.data.theme || {
      primaryColor: '#6366F1',
      secondaryColor: '#EC4899',
      accentColor: '#059669',
      textColor: '#1F2937',
      backgroundColor: '#FFFFFF'
    },
    subscription_plan: 'free',
    created_at: new Date().toISOString()
  };

  console.log(`✅ Created user profile for ${userEmail}`);

  return {
    user,
    products,
    categories
  };
}

/**
 * Convert string to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get color for category based on index
 */
function getColorForCategory(index: number): string {
  const colors = [
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#F43F5E'  // Rose
  ];
  return colors[index % colors.length];
}

/**
 * Extract original URL (remove affiliate parameters)
 */
function extractOriginalUrl(affiliateUrl: string): string {
  if (!affiliateUrl) return '';

  try {
    const url = new URL(affiliateUrl);

    // Remove common affiliate parameters
    const affiliateParams = [
      'tag', 'affid', 'aff_id',
      'utm_source', 'utm_medium', 'utm_campaign',
      'ref', 'referrer', 'affiliate',
      'associate', 'partner'
    ];

    affiliateParams.forEach(param => url.searchParams.delete(param));

    return url.toString();
  } catch (e) {
    // If URL parsing fails, return as-is
    return affiliateUrl;
  }
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
  if (!url) return 'other';

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('amazon')) return 'amazon';
  if (lowerUrl.includes('flipkart')) return 'flipkart';
  if (lowerUrl.includes('myntra')) return 'myntra';
  if (lowerUrl.includes('nykaa')) return 'nykaa';
  if (lowerUrl.includes('ajio')) return 'ajio';
  if (lowerUrl.includes('snapdeal')) return 'snapdeal';

  return 'other';
}

// ============================================
// MAIN EXECUTION
// ============================================

function main() {
  console.log('🚀 Shopmatic Data Transformation Script');
  console.log('==========================================\n');

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ Error: Missing required arguments\n');
    console.log('Usage:');
    console.log('  npx ts-node 03_transform_data.ts <export-file.json> <user-email> [user-name]\n');
    console.log('Example:');
    console.log('  npx ts-node 03_transform_data.ts export.json user@example.com "John Doe"\n');
    process.exit(1);
  }

  const exportFile = args[0];
  const userEmail = args[1];
  const userName = args[2] || 'User';

  // Validate export file exists
  if (!fs.existsSync(exportFile)) {
    console.error(`❌ Error: Export file not found: ${exportFile}\n`);
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    console.error(`❌ Error: Invalid email format: ${userEmail}\n`);
    process.exit(1);
  }

  console.log(`📂 Export file: ${exportFile}`);
  console.log(`📧 User email: ${userEmail}`);
  console.log(`👤 User name: ${userName}\n`);

  // Load export data
  let exportData: LocalStorageExport;
  try {
    const fileContent = fs.readFileSync(exportFile, 'utf-8');
    exportData = JSON.parse(fileContent);
    console.log(`✅ Loaded export file (version ${exportData.version})`);
    console.log(`📅 Export date: ${exportData.exportDate}\n`);
  } catch (e) {
    console.error('❌ Error: Failed to parse export file');
    console.error(e);
    process.exit(1);
  }

  // Transform data
  try {
    const transformed = transformData(exportData, userEmail, userName);

    // Generate output file name
    const outputFile = path.join(
      path.dirname(exportFile),
      `transformed-${path.basename(exportFile)}`
    );

    // Write transformed data
    fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2), 'utf-8');

    console.log('\n==========================================');
    console.log('✅ Transformation Complete!');
    console.log(`📦 Output file: ${outputFile}\n`);

    console.log('📊 Transformation Summary:');
    console.log(`   - User ID: ${transformed.user.id}`);
    console.log(`   - Products: ${transformed.products.length}`);
    console.log(`   - Categories: ${transformed.categories.length}`);
    console.log(`   - Theme: ${transformed.user.theme_settings ? 'Included' : 'Default'}\n`);

    console.log('📋 Category Breakdown:');
    transformed.categories.forEach(cat => {
      const productCount = transformed.products.filter(
        p => p.category_id === cat.id
      ).length;
      console.log(`   - ${cat.name}: ${productCount} products`);
    });

    console.log('\n✨ Next Step:');
    console.log(`   Run the import script to load data into Neon:`);
    console.log(`   npx ts-node 04_import_to_neon.ts ${outputFile}\n`);

  } catch (e) {
    console.error('\n❌ Error: Transformation failed');
    console.error(e);
    process.exit(1);
  }
}

// Run main function
main();

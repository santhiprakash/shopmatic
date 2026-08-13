/**
 * Export localStorage Data Script
 *
 * Run this script in the browser console to export all Shopmatic data
 * from localStorage to a JSON file.
 *
 * Usage:
 * 1. Open Shopmatic in your browser
 * 2. Open Developer Console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. A JSON file will be downloaded automatically
 */

(function exportShopmaticData() {
  console.log('🚀 Starting Shopmatic Data Export...');
  console.log('=====================================\n');

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    source: 'localStorage',
    data: {
      products: [],
      theme: null,
      auth: null,
      apiKeys: null,
      cookiePreferences: null,
      encryptionKey: null
    }
  };

  // Export products
  try {
    const productsRaw = localStorage.getItem('shopmatic-products');
    if (productsRaw) {
      exportData.data.products = JSON.parse(productsRaw);
      console.log(`✅ Exported ${exportData.data.products.length} products`);
    } else {
      console.log('⚠️  No products found');
    }
  } catch (e) {
    console.error('❌ Failed to export products:', e.message);
  }

  // Export theme settings
  try {
    const themeRaw = localStorage.getItem('shopmatic-theme');
    if (themeRaw) {
      exportData.data.theme = JSON.parse(themeRaw);
      console.log('✅ Exported theme settings');
      console.log('   Theme:', exportData.data.theme);
    } else {
      console.log('⚠️  No theme settings found');
    }
  } catch (e) {
    console.error('❌ Failed to export theme:', e.message);
  }

  // Export auth data (encrypted - will need re-registration)
  try {
    const authRaw = localStorage.getItem('shopmatic_auth');
    if (authRaw) {
      exportData.data.auth = authRaw; // Keep encrypted for security
      console.log('✅ Exported auth data (encrypted, for reference only)');
      console.log('   Note: Users will need to re-register with the new system');
    } else {
      console.log('⚠️  No auth data found');
    }
  } catch (e) {
    console.error('❌ Failed to export auth:', e.message);
  }

  // Export API keys (encrypted)
  try {
    const apiKeysRaw = localStorage.getItem('shopmatic_api_keys');
    if (apiKeysRaw) {
      exportData.data.apiKeys = apiKeysRaw; // Keep encrypted
      console.log('✅ Exported API keys (encrypted)');
      console.log('   Note: Users will need to re-enter API keys');
    } else {
      console.log('⚠️  No API keys found');
    }
  } catch (e) {
    console.error('❌ Failed to export API keys:', e.message);
  }

  // Export cookie preferences
  try {
    const cookiePrefsRaw = localStorage.getItem('shopmatic_cookie_preferences');
    if (cookiePrefsRaw) {
      exportData.data.cookiePreferences = JSON.parse(cookiePrefsRaw);
      console.log('✅ Exported cookie preferences');
    } else {
      console.log('⚠️  No cookie preferences found');
    }
  } catch (e) {
    console.error('❌ Failed to export cookie preferences:', e.message);
  }

  // Export encryption key (for reference - should not be used in production)
  try {
    const encKeyRaw = localStorage.getItem('shopmatic_encryption_key');
    if (encKeyRaw) {
      exportData.data.encryptionKey = encKeyRaw;
      console.log('✅ Exported encryption key (for reference)');
    }
  } catch (e) {
    console.error('❌ Failed to export encryption key:', e.message);
  }

  // Generate file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const fileName = `shopmatic-export-${timestamp}.json`;

  // Download as JSON file
  try {
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(url);

    console.log('\n=====================================');
    console.log('✅ Export Complete!');
    console.log(`📦 File: ${fileName}`);
    console.log('📊 Export Summary:');
    console.log(`   - Products: ${exportData.data.products.length}`);
    console.log(`   - Theme: ${exportData.data.theme ? 'Yes' : 'No'}`);
    console.log(`   - Auth: ${exportData.data.auth ? 'Yes (encrypted)' : 'No'}`);
    console.log(`   - API Keys: ${exportData.data.apiKeys ? 'Yes (encrypted)' : 'No'}`);
    console.log(`   - Cookie Prefs: ${exportData.data.cookiePreferences ? 'Yes' : 'No'}`);
    console.log('\n⚠️  Important Notes:');
    console.log('   1. Keep this file safe - it contains your data');
    console.log('   2. You will need to re-register your account');
    console.log('   3. You will need to re-enter your API keys');
    console.log('   4. Share this file with the migration team');

  } catch (e) {
    console.error('❌ Failed to download file:', e.message);
    console.log('\n📋 Copy the JSON below instead:');
    console.log('=====================================');
    console.log(JSON.stringify(exportData, null, 2));
  }

})();

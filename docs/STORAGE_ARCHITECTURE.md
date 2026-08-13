# Storage Architecture - Cloudflare R2

## Current State

### Image Storage Status
**Currently:** No dedicated storage solution implemented
- Product images: URLs stored as strings in database
- User avatars: URLs stored as strings in database
- No file upload functionality yet
- Images referenced by external URLs only

### What Needs Storage
1. **Product Images**
   - User-uploaded product photos
   - AI-extracted product images
   - Multiple images per product (gallery)
   - Thumbnails and optimized versions

2. **User Profile Images**
   - Avatar/profile pictures
   - Cover photos
   - Social media verification images

3. **Category Images**
   - Custom category icons
   - Category banners

4. **Platform Assets**
   - Theme customization images
   - Showcase page backgrounds
   - Marketing materials

---

## Cloudflare R2 Implementation

### Why Cloudflare R2?

**Advantages:**
- **Zero Egress Fees** - No bandwidth charges
- **S3 Compatible** - Easy migration, standard APIs
- **Global CDN** - Fast delivery worldwide
- **Cost Effective** - $0.015/GB storage, $0 egress
- **Simple Integration** - Works with existing S3 libraries

**Cost Comparison:**
| Provider | Storage (100GB) | Egress (1TB) | Total |
|----------|----------------|--------------|-------|
| AWS S3 | $2.30 | $92 | $94.30 |
| Cloudflare R2 | $1.50 | $0 | $1.50 |
| **Savings** | | | **$92.80/mo** |

---

## Implementation Plan

### 1. Setup Cloudflare R2

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create R2 bucket
wrangler r2 bucket create shopmatic-production
wrangler r2 bucket create shopmatic-staging
```

### 2. Environment Configuration

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=shopmatic-production
R2_PUBLIC_URL=https://cdn.shopmatic.dev

# Optional: Custom domain for R2
R2_CUSTOM_DOMAIN=cdn.shopmatic.dev
```

### 3. Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install multer sharp
npm install -D @types/multer @types/sharp
```

### 4. Storage Service Implementation

Create `src/lib/storage.ts`:

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const storage = {
  // Upload file
  async upload(file: Buffer, key: string, contentType: string) {
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    }));
    
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  },

  // Upload with image optimization
  async uploadImage(file: Buffer, key: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }) {
    const optimized = await sharp(file)
      .resize(options?.width, options?.height, { fit: 'inside' })
      .jpeg({ quality: options?.quality || 80 })
      .toBuffer();

    return this.upload(optimized, key, 'image/jpeg');
  },

  // Delete file
  async delete(key: string) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
  },

  // Get signed URL (for private files)
  async getSignedUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    
    return getSignedUrl(s3Client, command, { expiresIn });
  },
};
```

---

## File Upload API

### API Routes

```typescript
// POST /api/upload/product-image
export async function uploadProductImage(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = req.user.id; // from auth middleware
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('Only images allowed');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File too large');
  }
  
  // Generate unique key
  const key = `products/${userId}/${Date.now()}-${file.name}`;
  
  // Upload
  const buffer = await file.arrayBuffer();
  const url = await storage.uploadImage(Buffer.from(buffer), key, {
    width: 1200,
    quality: 85,
  });
  
  return { url };
}

// POST /api/upload/avatar
export async function uploadAvatar(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = req.user.id;
  
  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('Only images allowed');
  }
  
  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    throw new Error('File too large');
  }
  
  // Delete old avatar if exists
  const user = await db.queryOne('SELECT avatar_url FROM users WHERE id = $1', [userId]);
  if (user?.avatar_url) {
    const oldKey = user.avatar_url.split('/').slice(-2).join('/');
    await storage.delete(oldKey);
  }
  
  // Upload new avatar
  const key = `avatars/${userId}/${Date.now()}-${file.name}`;
  const buffer = await file.arrayBuffer();
  const url = await storage.uploadImage(Buffer.from(buffer), key, {
    width: 400,
    height: 400,
    quality: 90,
  });
  
  // Update database
  await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [url, userId]);
  
  return { url };
}
```

---

## Database Schema Updates

```sql
-- Add image columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add image columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add image columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create uploads tracking table
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    entity_type VARCHAR(50), -- 'product', 'avatar', 'category', etc.
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_entity ON uploads(entity_type, entity_id);
```

---

## Frontend Integration

### Upload Component

```typescript
// src/components/upload/ImageUpload.tsx
import { useState } from 'react';

export function ImageUpload({ onUpload, type = 'product' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'avatar' 
        ? '/api/upload/avatar' 
        : '/api/upload/product-image';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const { url } = await response.json();
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {preview && <img src={preview} alt="Preview" />}
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

## Custom Domain Setup

### 1. Add Custom Domain in Cloudflare

```bash
# In Cloudflare Dashboard:
# 1. Go to R2 > Bucket > Settings
# 2. Add custom domain: cdn.shopmatic.dev
# 3. Cloudflare will create DNS records automatically
```

### 2. Update Environment

```env
R2_PUBLIC_URL=https://cdn.shopmatic.dev
```

---

## Migration Strategy

### Existing Images

If you have existing image URLs:

```typescript
// scripts/migrate-images-to-r2.ts
async function migrateImages() {
  const products = await db.query('SELECT id, image FROM products WHERE image IS NOT NULL');
  
  for (const product of products) {
    try {
      // Download existing image
      const response = await fetch(product.image);
      const buffer = await response.arrayBuffer();
      
      // Upload to R2
      const key = `products/migrated/${product.id}.jpg`;
      const newUrl = await storage.uploadImage(Buffer.from(buffer), key);
      
      // Update database
      await db.query('UPDATE products SET image = $1 WHERE id = $2', [newUrl, product.id]);
      
      console.log(`Migrated product ${product.id}`);
    } catch (error) {
      console.error(`Failed to migrate product ${product.id}:`, error);
    }
  }
}
```

---

## Security Best Practices

### 1. File Validation

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
}
```

### 2. Rate Limiting

```typescript
// Limit uploads per user
const UPLOAD_LIMIT = 100; // per day
const uploadCount = await redis.get(`uploads:${userId}:${today}`);

if (uploadCount >= UPLOAD_LIMIT) {
  throw new Error('Upload limit exceeded');
}
```

### 3. Virus Scanning (Optional)

```typescript
// Integrate ClamAV or similar
import { scanFile } from './virus-scanner';

const isSafe = await scanFile(buffer);
if (!isSafe) {
  throw new Error('File contains malware');
}
```

---

## Monitoring & Cleanup

### Storage Usage Tracking

```typescript
// Track storage per user
async function getUserStorageUsage(userId: string) {
  const result = await db.queryOne(`
    SELECT SUM(file_size) as total_bytes
    FROM uploads
    WHERE user_id = $1
  `, [userId]);
  
  return result.total_bytes || 0;
}
```

### Cleanup Orphaned Files

```typescript
// Delete files not referenced in database
async function cleanupOrphanedFiles() {
  const uploads = await db.query('SELECT file_key FROM uploads');
  const keys = uploads.map(u => u.file_key);
  
  // List all files in R2
  const allFiles = await listAllR2Files();
  
  // Delete orphaned files
  for (const file of allFiles) {
    if (!keys.includes(file.Key)) {
      await storage.delete(file.Key);
      console.log(`Deleted orphaned file: ${file.Key}`);
    }
  }
}
```

---

## Cost Optimization

### Image Optimization

```typescript
// Generate multiple sizes
async function uploadWithVariants(file: Buffer, key: string) {
  const variants = [
    { suffix: 'thumb', width: 200, quality: 70 },
    { suffix: 'medium', width: 800, quality: 80 },
    { suffix: 'large', width: 1200, quality: 85 },
  ];
  
  const urls = {};
  
  for (const variant of variants) {
    const variantKey = key.replace(/\.(jpg|png)$/, `-${variant.suffix}.$1`);
    urls[variant.suffix] = await storage.uploadImage(file, variantKey, variant);
  }
  
  return urls;
}
```

### CDN Caching

```typescript
// Set cache headers
await s3Client.send(new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: key,
  Body: file,
  ContentType: contentType,
  CacheControl: 'public, max-age=31536000', // 1 year
}));
```

---

## Testing

```typescript
// tests/storage.test.ts
describe('Storage Service', () => {
  it('should upload image', async () => {
    const buffer = await fs.readFile('test-image.jpg');
    const url = await storage.uploadImage(buffer, 'test/image.jpg');
    expect(url).toContain('cdn.shopmatic.dev');
  });

  it('should delete image', async () => {
    await storage.delete('test/image.jpg');
    // Verify deletion
  });

  it('should optimize image', async () => {
    const buffer = await fs.readFile('large-image.jpg');
    const url = await storage.uploadImage(buffer, 'test/optimized.jpg', {
      width: 800,
      quality: 80,
    });
    // Verify size reduction
  });
});
```

---

## Deployment Checklist

- [ ] Create Cloudflare R2 bucket
- [ ] Generate R2 access keys
- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Implement storage service
- [ ] Create upload API routes
- [ ] Update database schema
- [ ] Implement frontend upload components
- [ ] Add file validation
- [ ] Set up monitoring
- [ ] Test uploads
- [ ] Migrate existing images (if any)

---

**Status:** Ready to implement  
**Estimated Time:** 1 week  
**Cost:** ~$1.50/month for 100GB storage  
**Dependencies:** Cloudflare account, R2 enabled

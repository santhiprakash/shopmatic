/**
 * Cloudflare R2 Storage Service
 * S3-compatible storage for file uploads
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

// Get R2 configuration from environment
const r2AccountId = import.meta.env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env.R2_ACCOUNT_ID : '');
const r2AccessKeyId = import.meta.env.R2_ACCESS_KEY_ID || (typeof process !== 'undefined' ? process.env.R2_ACCESS_KEY_ID : '');
const r2SecretAccessKey = import.meta.env.R2_SECRET_ACCESS_KEY || (typeof process !== 'undefined' ? process.env.R2_SECRET_ACCESS_KEY : '');
const r2BucketName = import.meta.env.R2_BUCKET_NAME || (typeof process !== 'undefined' ? process.env.R2_BUCKET_NAME : '');
const r2PublicUrl = import.meta.env.R2_PUBLIC_URL || (typeof process !== 'undefined' ? process.env.R2_PUBLIC_URL : '');

// Validate configuration
if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2BucketName) {
  console.warn('R2 storage configuration incomplete. File uploads will not work.');
}

// Create S3 client configured for R2
const s3Client = r2AccountId && r2AccessKeyId && r2SecretAccessKey ? new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
}) : null;

/**
 * Check if R2 storage is configured
 */
export function isR2Configured(): boolean {
  return Boolean(s3Client && r2BucketName);
}

/**
 * Upload a file to R2
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  if (!s3Client || !r2BucketName) {
    throw new Error('R2 storage is not configured');
  }

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    }));

    // Return public URL
    if (r2PublicUrl) {
      // Ensure no double slashes
      const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
      const fileKey = key.startsWith('/') ? key.slice(1) : key;
      return `${baseUrl}/${fileKey}`;
    } else {
      // Fallback to signed URL if no public URL configured
      return await getSignedUrlForFile(key, 31536000); // 1 year
    }
  } catch (error) {
    console.error('R2 upload failed:', error);
    throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload an image with optimization
 */
export async function uploadImage(
  file: Buffer | Uint8Array,
  key: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }
): Promise<string> {
  if (!s3Client || !r2BucketName) {
    throw new Error('R2 storage is not configured');
  }

  try {
    const format = options?.format || 'jpeg';
    const quality = options?.quality || 80;

    // Optimize image
    let optimized: Buffer;
    if (format === 'jpeg') {
      optimized = await sharp(file)
        .resize(options?.width, options?.height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .toBuffer();
    } else if (format === 'png') {
      optimized = await sharp(file)
        .resize(options?.width, options?.height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .png({ quality })
        .toBuffer();
    } else {
      optimized = await sharp(file)
        .resize(options?.width, options?.height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality })
        .toBuffer();
    }

    // Determine content type based on format
    const contentType = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
    
    // Update key extension if needed
    const keyWithExtension = key.includes('.') ? key : `${key}.${format === 'jpeg' ? 'jpg' : format}`;

    return await uploadFile(optimized, keyWithExtension, contentType);
  } catch (error) {
    console.error('R2 image upload failed:', error);
    throw new Error(`Failed to upload image to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  if (!s3Client || !r2BucketName) {
    throw new Error('R2 storage is not configured');
  }

  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    }));
  } catch (error) {
    console.error('R2 delete failed:', error);
    throw new Error(`Failed to delete file from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a file exists in R2
 */
export async function fileExists(key: string): Promise<boolean> {
  if (!s3Client || !r2BucketName) {
    return false;
  }

  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Get a signed URL for a file (for private files)
 */
export async function getSignedUrlForFile(key: string, expiresIn: number = 3600): Promise<string> {
  if (!s3Client || !r2BucketName) {
    throw new Error('R2 storage is not configured');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('R2 signed URL generation failed:', error);
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files in R2 (with optional prefix)
 */
export async function listFiles(prefix?: string, maxKeys: number = 1000): Promise<string[]> {
  if (!s3Client || !r2BucketName) {
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: r2BucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);
    return (response.Contents || []).map(obj => obj.Key || '').filter(Boolean);
  } catch (error) {
    console.error('R2 list files failed:', error);
    return [];
  }
}

// Export a storage object for convenience
export const storage = {
  isConfigured: isR2Configured,
  upload: uploadFile,
  uploadImage,
  delete: deleteFile,
  exists: fileExists,
  getSignedUrl: getSignedUrlForFile,
  list: listFiles,
};

export default storage;





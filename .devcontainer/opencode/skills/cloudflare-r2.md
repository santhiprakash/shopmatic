---
description: Cloudflare R2 storage operations and SDK usage
---

# Cloudflare R2 Storage

This skill covers Cloudflare R2 object storage operations for file uploads and management.

## Prerequisites

1. Cloudflare account with R2 enabled
2. R2 bucket created
3. Environment variables configured:
   - `R2_ENDPOINT`
   - `R2_ACCESS_KEY`
   - `R2_SECRET_KEY`
   - `R2_BUCKET`
   - `R2_PUBLIC_URL` (optional, for public buckets)

## Setup

### 1. Create R2 Bucket

In Cloudflare Dashboard:
1. Go to R2 > Create bucket
2. Name your bucket (e.g., `my-app-uploads`)
3. Note the endpoint URL

### 2. Create API Token

1. Go to R2 > Manage R2 API Tokens
2. Create token with Object Read & Write permissions
3. Note Access Key ID and Secret Access Key

### 3. Install AWS SDK

R2 is S3-compatible, so we use the AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Client Configuration

```typescript
// lib/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export const BUCKET = process.env.R2_BUCKET!;
```

## Common Operations

### Upload File

```typescript
// lib/r2.ts (continued)
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
  
  // Return public URL or signed URL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

### Generate Presigned Upload URL

For direct client uploads:

```typescript
export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
}
```

### Download File

```typescript
export async function downloadFile(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await r2Client.send(command);
  return response.Body;
}
```

### Generate Presigned Download URL

```typescript
export async function getPresignedDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
}
```

### Delete File

```typescript
export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await r2Client.send(command);
}
```

## Next.js API Route Example

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getPresignedUploadUrl } from '@/lib/r2';
import { getSession } from '@auth0/nextjs-auth0';
import { v4 as uuidv4 } from 'uuid';

// Direct upload (for small files)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const key = `uploads/${session.user.sub}/${uuidv4()}-${file.name}`;
  const url = await uploadFile(key, buffer, file.type);

  return NextResponse.json({ url, key });
}

// Presigned URL (for large files, direct client upload)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const contentType = searchParams.get('contentType');

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const key = `uploads/${session.user.sub}/${uuidv4()}-${filename}`;
  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
```

## React Upload Component

```typescript
// components/FileUpload.tsx
'use client';
import { useState } from 'react';

export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get presigned URL
      const res = await fetch(
        `/api/upload?filename=${file.name}&contentType=${file.type}`
      );
      const { uploadUrl, key } = await res.json();

      // Upload directly to R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
      onUpload(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <input
      type="file"
      onChange={handleUpload}
      disabled={uploading}
    />
  );
}
```

## CORS Configuration

For direct client uploads, configure CORS on your R2 bucket:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-app.vercel.app",
      "https://your-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Public Access

To make files publicly accessible:
1. Go to R2 bucket settings
2. Enable Public Access
3. Connect a custom domain (optional)
4. Use the public URL for accessing files

## Tips

- Use presigned URLs for large file uploads
- Organize files with user-specific prefixes
- Set appropriate CORS headers
- Use CDN (Cloudflare) for caching public files
- Implement file size and type validation

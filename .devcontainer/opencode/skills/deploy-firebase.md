---
description: Deploy application to Firebase Hosting
---

# Deploy to Firebase Hosting

This workflow guides you through deploying your application to Firebase Hosting.

## Prerequisites

1. Firebase CLI installed: `npm i -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Firebase project created in console

## Steps

### 1. Initial Setup (First Time Only)

```bash
# Initialize Firebase in your project
firebase init hosting

# Select options:
# - Choose existing project or create new
# - Public directory: out (for Next.js static) or dist (for Vite)
# - Configure as SPA: Yes (for React/Vue apps)
# - Set up automatic builds: No (we'll deploy manually)
```

### 2. Configure firebase.json

For Next.js static export:
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 3. Build Application

```bash
# For Next.js (static export)
npm run build

# For Vite
npm run build
```

### 4. Preview Deployment

```bash
# Deploy to preview channel
firebase hosting:channel:deploy preview
```

### 5. Production Deployment

```bash
# Deploy to production
firebase deploy --only hosting
```

### 6. Verify Deployment

After deployment, verify:
- [ ] Application loads at firebase URL
- [ ] All routes work correctly
- [ ] Static assets load properly
- [ ] API calls work (if using external APIs)

## Environment Variables

For client-side environment variables, ensure they are:
1. Prefixed with `NEXT_PUBLIC_` (Next.js) or `VITE_` (Vite)
2. Available at build time
3. Configured in your CI/CD or build script

```bash
# Example build with env vars
NEXT_PUBLIC_GA_ID=G-XXXXXX npm run build
```

## Rollback

```bash
# List release history
firebase hosting:channel:list

# Rollback using Firebase Console
# Go to Hosting > Release History > Select version > Rollback
```

## Tips

- Use `firebase emulators:start` for local testing
- Set up GitHub Actions for automatic deployments
- Use Firebase Admin SDK for server-side operations

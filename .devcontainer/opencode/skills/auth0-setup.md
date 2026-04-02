---
description: Auth0 integration patterns for Next.js and React applications
---

# Auth0 Setup Guide

This skill covers Auth0 integration for authentication in your applications.

## Prerequisites

1. Auth0 account and tenant
2. Application created in Auth0 dashboard
3. Environment variables configured:
   - `AUTH0_DOMAIN`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `AUTH0_SECRET` (for session encryption)

## Next.js Integration (App Router)

### 1. Install Dependencies

```bash
npm install @auth0/nextjs-auth0
```

### 2. Configure Environment Variables

```bash
# .env.local
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_TENANT.auth0.com'
AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'
```

### 3. Create Auth Route Handler

```typescript
// app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

### 4. Wrap App with UserProvider

```typescript
// app/layout.tsx
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <UserProvider>
        <body>{children}</body>
      </UserProvider>
    </html>
  );
}
```

### 5. Use Auth in Components

```typescript
// components/AuthButton.tsx
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AuthButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        <img src={user.picture} alt={user.name} />
        <span>{user.name}</span>
        <a href="/api/auth/logout">Logout</a>
      </div>
    );
  }

  return <a href="/api/auth/login">Login</a>;
}
```

### 6. Protect Server Components

```typescript
// app/dashboard/page.tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### 7. Protect API Routes

```typescript
// app/api/protected/route.ts
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = withApiAuthRequired(async (req) => {
  const session = await getSession();
  return NextResponse.json({ user: session?.user });
});
```

## Sync Users with Neon Database

```typescript
// lib/auth/sync-user.ts
import { getSession } from '@auth0/nextjs-auth0';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function syncUser() {
  const session = await getSession();
  if (!session?.user) return null;

  const { sub: auth0Id, email, name, picture } = session.user;

  // Upsert user
  const [user] = await db
    .insert(users)
    .values({
      auth0Id,
      email,
      name,
      avatarUrl: picture,
    })
    .onConflictDoUpdate({
      target: users.auth0Id,
      set: { name, avatarUrl: picture, updatedAt: new Date() },
    })
    .returning();

  return user;
}
```

## Auth0 Dashboard Configuration

### Allowed Callback URLs
```
http://localhost:3000/api/auth/callback
https://your-app.vercel.app/api/auth/callback
https://your-domain.com/api/auth/callback
```

### Allowed Logout URLs
```
http://localhost:3000
https://your-app.vercel.app
https://your-domain.com
```

### Allowed Web Origins
```
http://localhost:3000
https://your-app.vercel.app
https://your-domain.com
```

## Social Connections

Enable in Auth0 Dashboard > Authentication > Social:
- Google
- GitHub
- Apple
- Microsoft

## Role-Based Access Control

```typescript
// middleware.ts
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';

export default withMiddlewareAuthRequired(async (req) => {
  const session = await getSession(req, NextResponse.next());
  const roles = session?.user['https://your-app.com/roles'] || [];

  if (req.nextUrl.pathname.startsWith('/admin') && !roles.includes('admin')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

## Tips

- Use Auth0 Actions for custom login flows
- Enable MFA for enhanced security
- Use refresh tokens for long sessions
- Implement proper logout with session clearing

---
description: Google Analytics and Cloudflare Turnstile integration
---

# Analytics & Security Setup

This skill covers Google Analytics 4 and Cloudflare Turnstile integration.

## Google Analytics 4

### Prerequisites

1. Google Analytics account
2. GA4 property created
3. Measurement ID (G-XXXXXXXXXX)

### Environment Variables

```bash
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Next.js Integration

```typescript
// components/GoogleAnalytics.tsx
'use client';
import Script from 'next/script';

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
```

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
```

### Track Custom Events

```typescript
// lib/analytics.ts
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Usage
trackEvent('click', 'button', 'signup_cta');
trackEvent('purchase', 'ecommerce', 'premium_plan', 99);
```

### TypeScript Declarations

```typescript
// types/gtag.d.ts
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export {};
```

---

## Cloudflare Turnstile

### Prerequisites

1. Cloudflare account
2. Turnstile widget created
3. Site key and secret key

### Environment Variables

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAAA..."
```

### React Component

```typescript
// components/Turnstile.tsx
'use client';
import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function Turnstile({ onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (window.turnstile && containerRef.current && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: onVerify,
        'error-callback': onError,
        'expired-callback': onExpire,
      });
    }

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onVerify, onError, onExpire]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <div ref={containerRef} />
    </>
  );
}
```

### TypeScript Declarations

```typescript
// types/turnstile.d.ts
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export {};
```

### Server-Side Verification

```typescript
// lib/turnstile.ts
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );

  const data = await response.json();
  return data.success;
}
```

### Protected Form Example

```typescript
// app/contact/page.tsx
'use client';
import { useState } from 'react';
import { Turnstile } from '@/components/Turnstile';

export default function ContactPage() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!turnstileToken) {
      alert('Please complete the security check');
      return;
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, turnstileToken }),
    });

    if (res.ok) {
      alert('Message sent!');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message"
        required
      />
      <Turnstile onVerify={setTurnstileToken} />
      <button type="submit" disabled={!turnstileToken}>
        Send
      </button>
    </form>
  );
}
```

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(req: NextRequest) {
  const { message, turnstileToken } = await req.json();

  // Verify Turnstile token
  const isValid = await verifyTurnstileToken(turnstileToken);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Security verification failed' },
      { status: 400 }
    );
  }

  // Process the message...
  
  return NextResponse.json({ success: true });
}
```

## Tips

- Use GA4 debug mode during development
- Set up conversion tracking for key actions
- Use Turnstile invisible mode for better UX
- Test both managed and interactive challenge modes

# eComJunction - Complete System Documentation

**Project:** eComJunction (Shopmatic)
**Version:** 0.0.0
**Last Updated:** December 22, 2025
**Status:** Development Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Current Implementation Status](#current-implementation-status)
4. [Data Management](#data-management)
5. [Authentication & Authorization](#authentication--authorization)
6. [Product Management System](#product-management-system)
7. [AI Integration](#ai-integration)
8. [Security Features](#security-features)
9. [Theme Customization](#theme-customization)
10. [Compliance Features](#compliance-features)
11. [Technical Stack](#technical-stack)
12. [Known Issues & Improvements](#known-issues--improvements)
13. [Future Enhancements](#future-enhancements)

---

## Executive Summary

eComJunction is a SAAS platform designed for influencers and affiliate marketers to showcase and organize their product recommendations. The platform combines AI-powered product extraction, comprehensive theme customization, and robust security features to provide a complete solution for affiliate marketing.

### Key Highlights

- **Frontend-Only Architecture**: Currently operates entirely in the browser with localStorage persistence
- **AI-Powered**: Uses OpenAI GPT-4o-mini for intelligent product data extraction from URLs
- **Security-First**: Implements encryption, sanitization, CSP, and comprehensive security utilities
- **Privacy Compliant**: GDPR/CCPA compliant with cookie consent management
- **Production-Ready UI**: Complete with 13 pages, 50+ UI components, and responsive design

### Current Limitations

- **No Backend**: All data stored in localStorage (planned migration to Neon DB)
- **Mock Authentication**: Frontend-only auth without real session management
- **No Real Analytics**: Analytics tracking framework exists but not connected to backend
- **Limited Scale**: localStorage constraints limit data volume

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Auth      │  │  Product   │  │  Theme     │            │
│  │  Context   │  │  Context   │  │  Context   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │                │                │                  │
│         └────────────────┴────────────────┘                  │
│                         │                                    │
│                    localStorage                              │
│              (Encrypted for sensitive data)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ (Planned)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Future)                      │
│                      Neon PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                            │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   OpenAI     │  │   Supabase   │                        │
│  │  GPT-4o-mini │  │  (Planned)   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
ecomjunction/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── products/       # Product management components
│   │   ├── profile/        # User profile components
│   │   ├── theme/          # Theme customization
│   │   ├── affiliate/      # Affiliate ID management
│   │   ├── compliance/     # GDPR/CCPA components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # shadcn/ui components (50+)
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ProductContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/              # Route-level components (13 pages)
│   ├── services/           # Business logic services
│   │   ├── OpenAIService.ts
│   │   ├── ProductExtractionService.ts
│   │   ├── URLParsingService.ts
│   │   └── AffiliateUrlService.ts
│   ├── utils/              # Utility functions
│   │   ├── security.ts
│   │   ├── validation.ts
│   │   └── apiKeyManager.ts
│   ├── lib/                # Third-party integrations
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript definitions
│   └── data/               # Sample data
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/                 # Static assets
└── docs/                   # Documentation
```

---

## Current Implementation Status

### ✅ Completed Features

#### 1. User Interface (100%)
- ✅ 13 fully functional pages
- ✅ 50+ shadcn/ui components integrated
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode theme support
- ✅ Grid and list view modes
- ✅ Advanced filtering and search

#### 2. Product Management (90%)
- ✅ Manual product addition
- ✅ AI-powered URL extraction
- ✅ Product CRUD operations
- ✅ Category and tag management
- ✅ Affiliate URL injection
- ✅ Product filtering and sorting
- ⏳ Bulk operations (partially implemented)

#### 3. Authentication System (75% - Mock)
- ✅ Login/Register UI
- ✅ Session management (localStorage)
- ✅ Demo mode
- ✅ Password reset UI
- ✅ Session encryption
- ⏳ Real backend authentication (planned)

#### 4. Theme Customization (100%)
- ✅ Live color customization
- ✅ Hex to HSL conversion
- ✅ CSS variable injection
- ✅ Theme persistence
- ✅ Preset themes

#### 5. Security Features (95%)
- ✅ Input sanitization (DOMPurify)
- ✅ XSS protection
- ✅ Content Security Policy
- ✅ API key encryption (AES-GCM)
- ✅ Session integrity verification
- ✅ Rate limiting framework
- ⏳ Backend security (pending)

#### 6. Compliance (100%)
- ✅ GDPR cookie consent
- ✅ CCPA compliance
- ✅ Privacy policy
- ✅ Terms of service
- ✅ Cookie policy
- ✅ Affiliate disclosures

#### 7. AI Integration (100%)
- ✅ OpenAI GPT-4o-mini integration
- ✅ Product data extraction
- ✅ Confidence scoring
- ✅ Error handling
- ✅ Rate limiting

### 🚧 In Progress

- Theme selector enhancements
- Mobile responsiveness optimization
- Performance improvements

### 📋 Planned Features

- Backend API integration
- Real-time analytics
- Payment integration (Stripe)
- Multi-user collaboration
- Custom domain support
- Email notifications
- Advanced reporting

---

## Data Management

### Current Storage: localStorage

#### Storage Keys

| Key | Purpose | Data Type | Encryption | Size Estimate |
|-----|---------|-----------|------------|---------------|
| `shopmatic-products` | Product catalog | JSON Array | No | ~500B per product |
| `shopmatic-theme` | Theme settings | JSON Object | No | ~200B |
| `shopmatic_auth` | User session | JSON Object | Yes (AES-GCM) | ~500B |
| `shopmatic_api_keys` | API credentials | JSON Object | Yes (AES-GCM) | ~300B |
| `shopmatic_encryption_key` | Crypto key | ArrayBuffer | No | 32 bytes |
| `shopmatic_cookie_consent` | Cookie consent | Boolean | No | <10B |
| `shopmatic_cookie_preferences` | Privacy settings | JSON Object | No | ~200B |

### Data Structures

#### Product Interface
```typescript
interface Product {
  id: string;                    // UUID v4
  title: string;                 // 1-200 characters
  description: string;           // 1-1000 characters
  price: number;                 // 0 to 1,000,000
  currency: "USD" | "INR" | "EUR" | "GBP";
  rating: number;                // 0-5 scale
  image: string;                 // Image URL (validated)
  link: string;                  // Product URL (validated)
  source: string;                // Amazon, Flipkart, Myntra, Nykaa, Other
  tags: string[];                // Max 10 tags, 50 chars each
  categories: string[];          // Max 5 categories, 50 chars each
  createdAt: Date;               // ISO timestamp
}
```

#### User Interface
```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // Email format validated
  name: string;                  // Display name
  avatar?: string;               // Avatar URL
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  lastLoginAt: Date;
  isDemo?: boolean;              // Demo mode flag
}
```

#### Theme Settings Interface
```typescript
interface ThemeSettings {
  primaryColor: string;          // Hex color
  secondaryColor: string;        // Hex color
  accentColor: string;           // Hex color
  textColor: string;             // Hex color
  backgroundColor: string;       // Hex color
}
```

### Data Validation

All data undergoes strict validation using Zod schemas:

```typescript
// Product validation schema
const productSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  price: z.number().min(0).max(1000000),
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP']),
  rating: z.number().min(0).max(5),
  image: z.string().url(),
  link: z.string().url(),
  source: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(10),
  categories: z.array(z.string().max(50)).max(5)
});
```

---

## Authentication & Authorization

### Current Implementation: Mock Authentication

#### Features

1. **Email/Password Login**
   - Frontend validation
   - Mock credential checking
   - Session creation with encryption

2. **User Registration**
   - Email format validation
   - Password strength checking (mock)
   - Automatic session creation

3. **Demo Mode**
   - Instant access without persistence
   - Pre-filled sample data
   - No account required

4. **Session Management**
   - 24-hour session expiration
   - Encrypted localStorage storage
   - Integrity verification with SHA-256 hash
   - Automatic validation on app load

#### Mock User Database

```typescript
const mockUsers = [
  {
    email: 'user@example.com',
    password: 'password123', // Mock only - not secure
    name: 'Demo User',
    plan: 'free'
  },
  {
    email: 'pro@example.com',
    password: 'password123',
    name: 'Pro User',
    plan: 'pro'
  }
];
```

#### Session Structure

```typescript
interface Session {
  user: User;
  timestamp: number;
  expiresAt: number;
  hash: string;              // SHA-256 integrity hash
}
```

#### Session Encryption

- **Algorithm**: AES-GCM (256-bit)
- **IV**: Randomly generated per encryption
- **Key Storage**: localStorage (should be server-side in production)
- **Integrity Check**: SHA-256 hash validation

### Protected Routes

Routes requiring authentication:
- `/dashboard` - User dashboard
- `/my-products` - Product management
- `/analytics` - Analytics dashboard
- `/privacy-settings` - Privacy controls

### Authorization Levels

1. **Free Users** (50 products max)
   - Basic customization
   - Standard analytics
   - Community support

2. **Pro Users** (Unlimited)
   - Advanced customization
   - Detailed analytics
   - Priority support

3. **Enterprise Users**
   - Team collaboration
   - API access
   - White-label options

---

## Product Management System

### Product Lifecycle

```
1. Addition
   ├── Manual Entry (Form)
   └── AI Extraction (URL)
        ├── URL Parsing
        ├── HTML Fetching
        ├── OpenAI Processing
        └── Data Validation

2. Storage
   ├── Input Sanitization
   ├── Zod Validation
   └── localStorage Persistence

3. Display
   ├── Filtering (Category, Tags, Price, Rating)
   ├── Searching (Title, Description)
   ├── Sorting (Date, Price, Rating)
   └── View Modes (Grid, List)

4. Modification
   ├── Edit (Full form editing)
   └── Delete (Soft delete with confirmation)

5. Sharing
   └── Affiliate URL with injected ID
```

### AI-Powered Product Extraction

#### Workflow

1. **User Input**: Paste product URL
2. **URL Validation**: Check format and domain
3. **HTML Fetching**: Retrieve page content
4. **Content Parsing**: Extract meta tags and basic info
5. **AI Processing**: OpenAI analyzes content
6. **Data Extraction**: Parse AI response
7. **Confidence Scoring**: Validate extraction quality
8. **Sanitization**: Clean all extracted data
9. **Storage**: Save to localStorage

#### OpenAI Service Configuration

```typescript
{
  model: 'gpt-4o-mini',
  temperature: 0.3,
  max_tokens: 800,
  rate_limit: 20 requests/minute
}
```

#### Extraction Prompt

```
Analyze the following product information and extract:
- Title (concise, max 200 chars)
- Description (compelling, max 1000 chars)
- Price (numeric value only)
- Currency (USD, INR, EUR, GBP)
- Categories (up to 5, general product categories)
- Tags (up to 10, specific features/attributes)
- Confidence score (0-100, extraction quality)
```

### Affiliate URL Management

#### Supported Platforms

1. **Amazon**
   - Parameter: `tag`
   - Example: `?tag=youraffid-20`
   - ASIN extraction supported

2. **Flipkart**
   - Parameter: `affid`
   - Example: `?affid=youraffid`
   - Product ID extraction supported

3. **Myntra**
   - Parameters: `utm_source`, `utm_medium`
   - Example: `?utm_source=affiliate&utm_medium=youraffid`

4. **Nykaa**
   - Parameters: `utm_source`, `utm_medium`
   - Example: `?utm_source=affiliate&utm_medium=youraffid`

#### URL Injection Process

```typescript
function injectAffiliateId(url: string, platform: string, affId: string): string {
  const urlObj = new URL(url);

  switch(platform) {
    case 'amazon':
      urlObj.searchParams.set('tag', affId);
      break;
    case 'flipkart':
      urlObj.searchParams.set('affid', affId);
      break;
    case 'myntra':
    case 'nykaa':
      urlObj.searchParams.set('utm_source', 'affiliate');
      urlObj.searchParams.set('utm_medium', affId);
      break;
  }

  return urlObj.toString();
}
```

### Filtering & Search

#### Filter Options

- **Categories**: Multi-select from available categories
- **Tags**: Multi-select from available tags
- **Price Range**: Slider with min/max values
- **Rating**: Minimum rating threshold (0-5 stars)
- **Search Query**: Text search in title and description

#### Sort Options

- **Newest**: Sort by `createdAt` descending
- **Price: Low to High**: Sort by `price` ascending
- **Price: High to Low**: Sort by `price` descending
- **Rating**: Sort by `rating` descending

#### View Modes

- **Grid View**: Card layout, 3-4 columns responsive
- **List View**: Detailed row layout with expanded info

---

## AI Integration

### OpenAI GPT-4o-mini

#### Service Configuration

**File**: `src/services/OpenAIService.ts`

```typescript
class OpenAIService {
  private apiKey: string;
  private model = 'gpt-4o-mini';
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
  }
}
```

#### API Request Structure

```typescript
{
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'You are a product data extraction assistant...'
    },
    {
      role: 'user',
      content: `Extract product information from:\n${htmlContent}`
    }
  ],
  temperature: 0.3,
  max_tokens: 800,
  response_format: { type: 'json_object' }
}
```

#### Response Structure

```typescript
{
  title: string;
  description: string;
  price: number;
  currency: string;
  categories: string[];
  tags: string[];
  confidence: number;        // 0-100 score
}
```

#### Error Handling

1. **Invalid API Key**: Show setup dialog
2. **Rate Limit Exceeded**: Queue requests with exponential backoff
3. **API Error**: Fallback to basic URL parsing
4. **Invalid Response**: Retry with modified prompt
5. **Network Error**: Show user-friendly error message

#### Rate Limiting

- **Client-Side**: 20 requests per minute
- **Implementation**: Token bucket algorithm
- **Storage**: In-memory request history
- **Cleanup**: Automatic window cleanup after expiration

### Fallback Mechanisms

When AI extraction fails:

1. **URL Parsing**: Extract title from meta tags
2. **Image Extraction**: Use Open Graph image
3. **Description**: Use meta description
4. **Manual Override**: User can edit all fields

---

## Security Features

### Input Sanitization

#### HTML Sanitization (DOMPurify)

```typescript
class InputSanitizer {
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    });
  }
}
```

#### Text Sanitization

Removes dangerous patterns:
- `<script>` tags
- `javascript:` protocol
- Event handlers (`onclick`, `onerror`, etc.)
- Suspicious characters: `<`, `>`, `&`

#### URL Validation

```typescript
function validateUrl(url: string): boolean {
  // 1. Check protocol (https only in production)
  // 2. Validate format
  // 3. Block suspicious domains
  // 4. Check for XSS attempts in URL

  const suspiciousDomains = [
    'data:', 'javascript:', 'vbscript:',
    'file:', 'about:', 'chrome:'
  ];

  return !suspiciousDomains.some(domain =>
    url.toLowerCase().includes(domain)
  );
}
```

### Encryption (Web Crypto API)

#### API Key Encryption

**Algorithm**: AES-GCM 256-bit

```typescript
class APIKeyManager {
  async encryptKey(key: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);

    const cryptoKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );

    return { encrypted, iv, key: cryptoKey };
  }
}
```

#### Session Encryption

- **Algorithm**: AES-GCM
- **Key Size**: 256 bits
- **IV**: 12 bytes, randomly generated
- **Additional Data**: User ID for authenticated encryption

#### Integrity Verification

```typescript
async function verifySession(session: Session): Promise<boolean> {
  const hash = await SecurityUtils.hashSHA256(
    JSON.stringify({
      user: session.user,
      timestamp: session.timestamp,
      expiresAt: session.expiresAt
    })
  );

  return hash === session.hash;
}
```

### Content Security Policy (CSP)

#### Headers

```typescript
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'nonce-{random}'"],
  'style-src': ["'self'", "'unsafe-inline'"], // Required for Tailwind
  'img-src': ["'self'", 'https:', 'data:'],
  'connect-src': ["'self'", 'https://api.openai.com', 'https://*.supabase.co'],
  'font-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};
```

#### CSP Violation Reporting

```typescript
class CSPReporter {
  static violations: CSPViolation[] = [];

  static reportViolation(violation: CSPViolation): void {
    this.violations.push(violation);

    if (import.meta.env.DEV) {
      console.warn('CSP Violation:', violation);
    }
  }
}
```

### XSS Protection

#### Multiple Layers

1. **Input Sanitization**: All user inputs cleaned
2. **Output Encoding**: HTML entities encoded
3. **CSP**: Blocks inline scripts
4. **URL Validation**: Prevents `javascript:` URLs
5. **Form Validation**: Zod schemas prevent injection

#### Dangerous Pattern Detection

```typescript
const dangerousPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,  // Event handlers
  /eval\(/gi,
  /expression\(/gi,
  /<iframe/gi
];
```

### Rate Limiting

#### Client-Side Implementation

```typescript
class RateLimiter {
  private requests: Map<string, number[]>;

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove expired requests
    const validRequests = requests.filter(
      time => now - time < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}
```

#### Applied To

- OpenAI API calls: 20 requests/minute
- Authentication attempts: 5 attempts/5 minutes (planned)
- Password reset: 3 attempts/hour (planned)

---

## Theme Customization

### Architecture

**File**: `src/contexts/ThemeContext.tsx`

#### Color Management

```typescript
interface ThemeSettings {
  primaryColor: string;      // Hex format
  secondaryColor: string;    // Hex format
  accentColor: string;       // Hex format
  textColor: string;         // Hex format
  backgroundColor: string;   // Hex format
}
```

#### Hex to HSL Conversion

```typescript
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
```

#### CSS Variable Injection

```typescript
function applyTheme(theme: ThemeSettings): void {
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, hexColor]) => {
    const { h, s, l } = hexToHSL(hexColor);
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, `${h} ${s}% ${l}%`);
  });
}
```

#### Preset Themes

```typescript
const presetThemes = {
  default: {
    primaryColor: '#6366F1',    // Indigo-500
    secondaryColor: '#EC4899',  // Pink-500
    accentColor: '#059669',     // Emerald-600
    textColor: '#1F2937',       // Gray-800
    backgroundColor: '#FFFFFF'  // White
  },
  sunset: {
    primaryColor: '#F59E0B',    // Amber-500
    secondaryColor: '#EF4444',  // Red-500
    accentColor: '#EC4899',     // Pink-500
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF'
  },
  ocean: {
    primaryColor: '#3B82F6',    // Blue-500
    secondaryColor: '#06B6D4',  // Cyan-500
    accentColor: '#10B981',     // Green-500
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF'
  }
};
```

### Real-Time Preview

- Changes apply immediately via CSS variable updates
- No page reload required
- Persistent across sessions (localStorage)
- Reset to default option available

---

## Compliance Features

### GDPR Compliance

#### Cookie Consent Management

**Component**: `src/components/compliance/CookieConsent.tsx`

#### Consent Types

1. **Essential Cookies** (Always on)
   - Session management
   - Security features
   - Core functionality

2. **Analytics Cookies** (Optional)
   - User behavior tracking
   - Performance monitoring
   - Error reporting

3. **Marketing Cookies** (Optional)
   - Advertising
   - Retargeting
   - Social media integration

#### User Rights

- ✅ Right to access data
- ✅ Right to delete data
- ✅ Right to export data
- ✅ Right to withdraw consent
- ✅ Right to be forgotten

#### Data Export

```typescript
function exportUserData(): UserDataExport {
  return {
    profile: getCurrentUser(),
    products: getAllProducts(),
    theme: getThemeSettings(),
    preferences: getCookiePreferences(),
    exportDate: new Date().toISOString()
  };
}
```

### CCPA Compliance

- ✅ "Do Not Sell My Personal Information" option
- ✅ Privacy policy with CCPA addendum
- ✅ Data deletion requests
- ✅ Third-party disclosure

### FTC Compliance

#### Affiliate Disclosures

Automatically detected and displayed when:
- Product links contain affiliate parameters
- User has affiliate IDs configured
- Product is from affiliate program

**Disclosure Text**:
> "As an Amazon Associate and affiliate marketer, I earn from qualifying purchases. This means I may receive a commission if you click on a link and make a purchase, at no additional cost to you."

---

## Technical Stack

### Frontend

#### Core Framework
- **React 18.3.1**: Component-based UI
- **TypeScript 5.5.3**: Type safety
- **Vite 5.4.1**: Build tool and dev server

#### UI Components
- **shadcn/ui**: 50+ pre-built components
- **Radix UI**: Headless component primitives
- **Tailwind CSS 3.4.11**: Utility-first styling
- **Lucide React**: Icon library (462 icons)

#### State Management
- **React Context API**: Global state
- **TanStack Query 5.56.2**: Server state
- **React Hook Form 7.53.0**: Form management

#### Routing & Navigation
- **React Router DOM 6.26.2**: Client-side routing

#### Data Visualization
- **Recharts 2.12.7**: Charts and graphs

#### Validation & Sanitization
- **Zod 3.25.76**: Schema validation
- **DOMPurify 3.2.6**: HTML sanitization

#### Utilities
- **date-fns 3.6.0**: Date manipulation
- **uuid 11.1.0**: UUID generation
- **clsx 2.1.1**: Conditional classnames

### Development Tools

#### Testing
- **Vitest 3.2.4**: Unit testing framework
- **Testing Library**: React component testing
- **jsdom 26.1.0**: DOM environment for tests

#### Linting & Formatting
- **ESLint 9.9.0**: JavaScript/TypeScript linting
- **TypeScript ESLint 8.0.1**: TypeScript-specific rules

#### Build Tools
- **Vite SWC Plugin**: Fast refresh with SWC
- **PostCSS**: CSS processing
- **Autoprefixer**: Vendor prefixes

### Backend (Planned)

#### Database
- **Neon PostgreSQL**: Serverless Postgres (planned)
- **Supabase**: BaaS alternative (configured)

#### Authentication
- **JWT**: Token-based auth (planned)
- **bcrypt**: Password hashing (planned)

#### API
- **REST API**: Standard HTTP endpoints (planned)
- **Express.js**: API framework (planned)

### External Services

#### AI
- **OpenAI**: GPT-4o-mini for product extraction
- **API Key**: Encrypted client-side storage

#### Planned Integrations
- **Stripe**: Payment processing
- **SendGrid**: Email delivery
- **Cloudinary**: Image optimization
- **Google Analytics**: Usage tracking

### Infrastructure (Planned)

- **Hosting**: Vercel or AWS
- **CDN**: CloudFlare
- **Domain**: Custom domain support
- **SSL**: Automatic HTTPS

---

## Known Issues & Improvements

### Critical Issues

#### 1. localStorage Limitations
**Issue**: All data stored in localStorage
- Limited to ~5-10MB per origin
- No cross-device synchronization
- Easy to clear/lose data
- No concurrent user support

**Impact**: High
**Priority**: P0
**Solution**: Migrate to Neon PostgreSQL

#### 2. Mock Authentication
**Issue**: Frontend-only authentication
- Not secure
- No real session management
- No password hashing
- No email verification

**Impact**: High
**Priority**: P0
**Solution**: Implement backend auth with JWT

#### 3. No Real Analytics
**Issue**: Analytics framework exists but no data collection
- No click tracking
- No conversion tracking
- No visitor analytics

**Impact**: Medium
**Priority**: P1
**Solution**: Implement backend analytics service

### Major Issues

#### 4. Client-Side Rate Limiting
**Issue**: Rate limits enforced in browser
- Can be bypassed
- Not shared across tabs
- No global limits

**Impact**: Medium
**Priority**: P1
**Solution**: Server-side rate limiting

#### 5. API Key Storage
**Issue**: OpenAI key stored in browser
- Risk of exposure
- No key rotation
- No usage tracking

**Impact**: Medium
**Priority**: P1
**Solution**: Proxy API calls through backend

#### 6. No Image Optimization
**Issue**: Images loaded at full size
- Slow page loads
- High bandwidth usage
- Poor mobile performance

**Impact**: Medium
**Priority**: P2
**Solution**: Integrate Cloudinary or similar

### Minor Issues

#### 7. Large Component Files
**Files**: ProductFilters.tsx, Documentation.tsx
- Hard to maintain
- Difficult to test
- Poor code organization

**Impact**: Low
**Priority**: P3
**Solution**: Refactor into smaller components

#### 8. No Error Boundary Recovery
**Issue**: Error boundary shows error but no recovery
- User must refresh page
- Lost unsaved data

**Impact**: Low
**Priority**: P3
**Solution**: Add error recovery actions

#### 9. No Offline Support
**Issue**: App requires internet connection
- No service worker
- No offline caching
- No offline functionality

**Impact**: Low
**Priority**: P4
**Solution**: Implement PWA features

### Enhancements Needed

#### 10. Performance Optimizations
- [ ] Implement virtual scrolling for large product lists
- [ ] Add image lazy loading
- [ ] Code splitting for routes
- [ ] Bundle size optimization
- [ ] Memoization for expensive computations

#### 11. Testing Coverage
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security tests

#### 12. Documentation
- [x] System documentation (this file)
- [ ] API documentation
- [ ] Component documentation
- [ ] Developer onboarding guide
- [ ] Deployment guide

---

## Future Enhancements

### Phase 1: Backend Migration (Q1 2026)
- [ ] Set up Neon PostgreSQL database
- [ ] Migrate schema from Supabase design
- [ ] Create REST API with Express.js
- [ ] Implement JWT authentication
- [ ] Migrate localStorage data
- [ ] Update frontend to use API

### Phase 2: Analytics & Insights (Q2 2026)
- [ ] Implement click tracking
- [ ] Add conversion tracking
- [ ] Build analytics dashboard
- [ ] Revenue tracking
- [ ] Performance metrics
- [ ] Export reports

### Phase 3: SAAS Features (Q3 2026)
- [ ] Stripe payment integration
- [ ] Subscription management
- [ ] Multi-user workspaces
- [ ] Team collaboration
- [ ] Role-based access control
- [ ] Usage billing

### Phase 4: Advanced Features (Q4 2026)
- [ ] Custom domain support
- [ ] White-label options
- [ ] API access for Pro users
- [ ] Webhooks
- [ ] Advanced integrations
- [ ] Mobile app (React Native)

### Phase 5: Scale & Optimize (2027)
- [ ] CDN integration
- [ ] Image optimization pipeline
- [ ] Advanced caching
- [ ] Load balancing
- [ ] Database optimization
- [ ] Performance monitoring

---

## Appendix

### Environment Variables

```bash
# OpenAI Integration
VITE_OPENAI_API_KEY=sk-...

# Supabase (Configured but not active)
VITE_SUPABASE_URL=https://lrmupwtxuzntasrgnccg.supabase.co
VITE_SUPABASE_ANON_KEY=...

# App Configuration
VITE_ENV=development
VITE_APP_NAME=eComJunction
VITE_APP_URL=http://localhost:8080

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ADVANCED_FEATURES=false
```

### Build Commands

```bash
# Development
npm run dev              # Start dev server on :8080

# Production
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report

# Linting
npm run lint             # Run ESLint
```

### Contact Information

**Project**: eComJunction (Shopmatic)
**Website**: shopmatic.cc
**Email**: info@shopmatic.cc
**Address**: Shivakrupa Nilayam, TC Palya, Bengaluru, KA, India - 560036

---

**Document Version**: 1.0
**Last Updated**: December 22, 2025
**Maintained By**: Development Team

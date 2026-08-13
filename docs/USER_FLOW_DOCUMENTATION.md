# Shopmatic User Flow Documentation

**Document Version:** 2.0  
**Last Updated:** 2026-04-03  
**Status:** Draft - For Review  
**Product Domain:** shopmatic.cc

---

## 1. Product Overview

### 1.1 What is shopmatic.cc?

shopmatic.cc is a SAAS platform that empowers **Curators** (influencers and affiliate marketers) to curate, showcase, and share product recommendations with their audience. Anyone can add any product from any online platform (Amazon, Flipkart, AppSumo, etc.) - physical products, subscriptions, or digital products - and share them via personalized collection pages.

**Core Concept:**
> "Add any product. Create collections. Share with your world. Track your impact."

### 1.2 The Two User Types

| Role | Description | Registration Required |
|------|-------------|---------------------|
| **Curator** | Adds products, creates collections, shares pages | ✅ Yes |
| **Sharer** | Shares products/pages with network, contributes to spread | ✅ Yes |
| **Buyer/Visitor** | Views products, clicks through to buy | ❌ No |

**Note:** A Curator IS a Sharer - they can both create and share. A Sharer who discovers a page can register to share it further with their own network.

### 1.3 Core Value Proposition

| For Curators | For Sharers |
|--------------|-------------|
| AI-powered product extraction from any URL | Zero-friction sharing (no account needed to browse) |
| Beautiful, customizable collection pages | Register once, share anything |
| Track clicks, geography, and audience engagement | Earn recognition for spreading great products |
| No product restrictions (except unethical/illegal) | Help friends discover products you love |
| Free tier with generous limits | Built-in WhatsApp/social sharing |

### 1.4 Product Guidelines

**Allowed:**
- Physical products (electronics, fashion, home goods)
- Digital products (courses, software, ebooks)
- Subscriptions (SaaS, memberships, boxes)
- Products from any platform (Amazon, Flipkart, AppSumo, etc.)

**NOT Allowed:**
- Illegal products or services
- Counterfeit goods
- Products promoting hate or violence
- Adult content (without age verification)
- Misleading or fraudulent products
- Products violating platform terms from source

*Full guidelines in Terms of Service and separate Content Policy document.*

### 1.2 Core Value Proposition

| User Need | How Shopmatic Addresses It |
|-----------|-------------------------------|
| "I find products online but can't easily organize them" | AI extracts product details from any URL |
| "I want to share my recommendations professionally" | Beautiful, shareable storefronts with themes |
| "I need to track my affiliate links" | Built-in affiliate ID management |
| "I work with a team" | Collaboration features with role-based access |
| "I need my page to look professional" | Customizable themes and branding |

---

## 2. User Types Deep Dive

### 2.1 Curator (Influencer/Affiliate Marketer)

**Who they are:** Someone who finds and recommends products to their audience. Could be a tech reviewer, fashion blogger, deal hunter, or anyone with a network to share with.

**What they do:**
- Add products by pasting URLs (AI extracts details automatically)
- Create collection pages around themes ("My Top 10 Tech Gadgets 2026")
- Customize page appearance to match their brand
- Share pages via social media, WhatsApp, blogs
- Track analytics (clicks, geography, referrers)

**Motivation:**
- Save time curating products
- Look professional with minimal effort
- Understand what their audience engages with
- Monetize their recommendations

**Key Screens:**
1. Dashboard (stats overview)
2. My Products (product library)
3. My Pages (collection pages)
4. Analytics (performance metrics)
5. Settings (profile, affiliate IDs, theme)

### 2.2 Sharer (Contributor/Network Spreader)

**Who they are:** An end user who discovers a collection page and wants to share it with their own network. They might be a friend helping friends discover great products.

**What they do:**
- Browse collection pages without registering
- Click products to go directly to purchase
- Register to unlock sharing features
- Share individual products or entire collections
- Create their own collections (optional)

**Motivation:**
- Share products they believe in
- Help their network discover useful things
- Get credit for being a trusted source

**Key Screens:**
1. Public Collection Page (browse without account)
2. Product Detail Modal (view details, click to buy)
3. Registration/Login (to enable sharing)
4. Share Confirmation (track their impact)

### 2.3 Buyer/Visitor (Anonymous)

**Who they are:** Anyone who clicks on a shared link. No registration required.

**What they do:**
- View curated collection pages
- Click products → goes directly to product page
- Share pages/products directly (opens share dialog)
- Optionally register to save preferences

**Key Screens:**
1. Public Collection Page
2. Product Detail (inline, no modal)
3. Direct link to product page

---

## 3. User Journey

### 3.1 Curator Journey (Complete Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURATOR COMPLETE JOURNEY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: DISCOVERY                                                          │
│  User finds shopmatic.cc via:                                                │
│  ├── Google Search (productivity tools, page builders)                     │
│  ├── Social Media (Twitter, LinkedIn, YouTube)                             │
│  ├── Word of Mouth (referrals from other curators)                          │
│  └── Content Marketing (SEO for "affiliate page builder")                 │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: SIGN UP (becoming a Curator)                                       │
│                                                                             │
│  LANDING PAGE (/)                                                            │
│  ├── Hero: "Curate. Share. Track."                                         │
│  ├── "Start Free" CTA                                                       │
│  └── "See Examples" showing sample pages                                   │
│                                                                             │
│  SIGNUP (/register)                                                          │
│  ├── Email + Password                                                       │
│  ├── Username (for URL: shopmatic.cc/@username)                            │
│  └── Agree to Terms + Content Guidelines                                    │
│                                                                             │
│  Demo Mode available: "Try without account" → loads sample data             │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: ONBOARDING (first-time curators)                                   │
│                                                                             │
│  ONBOARDING WIZARD                                                           │
│  ├── Step 1: "What brings you here?"                                       │
│  │       Options: Influencer, Blogger, Deal Hunter, Just Exploring         │
│  │                                                                         │
│  ├── Step 2: "Add your first product"                                     │
│  │       Paste URL → AI extracts details                                   │
│  │       Or "Skip, I'll do this later"                                     │
│  │                                                                         │
│  ├── Step 3: "Create your first collection"                                │
│  │       Name your collection, add products                                 │
│  │       Or "Skip, I'll do this later"                                     │
│  │                                                                         │
│  └── Step 4: "You're ready!"                                               │
│          Preview dashboard                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: DAILY CURATOR WORKFLOW                                            │
│                                                                             │
│  A) ADDING A PRODUCT                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Click "Add Product" button                                         │   │
│  │ 2. Paste URL from ANY platform (Amazon, Flipkart, AppSumo, etc.)     │   │
│  │ 3. AI extracts: title, price, description, images, rating             │   │
│  │ 4. Review/edit extracted data                                         │   │
│  │ 5. Add to collection (or keep as standalone)                         │   │
│  │ 6. Set affiliate link (auto-append your IDs)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  B) CREATING A COLLECTION                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Go to "My Pages" → "Create New"                                  │   │
│  │ 2. Name your collection (e.g., "2026 Tech Favorites")              │   │
│  │ 3. Add products from your library                                   │   │
│  │ 4. Customize theme (colors, layout)                                  │   │
│  │ 5. Add optional: bio, social links, custom header                    │   │
│  │ 6. Preview → Publish                                                 │   │
│  │ 7. Get shareable link: shopmatic.cc/@username/collection-slug        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  C) ANALYTICS & TRACKING                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Dashboard shows:                                                      │   │
│  │ ├── Total page views                                                 │   │
│  │ ├── Product clicks (by collection and product)                       │   │
│  │ ├── Traffic sources (direct, social, search)                         │   │
│  │ ├── Geography (countries/cities)                                     │   │
│  │ └── Top performing products                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 5: GROWTH (optional)                                                   │
│                                                                             │
│  Upgrade to Pro/Enterprise for:                                             │
│  ├── Custom domain (yourname.com instead of shopmatic.cc/@you)            │
│  ├── More collections and products                                         │
│  ├── Team collaboration (add editors)                                     │
│  ├── Advanced analytics                                                    │
│  └── API access                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Sharer Journey (Discovery to Sharing)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SHARER COMPLETE JOURNEY                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: DISCOVERY (Receiving a Shared Link)                                │
│                                                                             │
│  User receives link via:                                                     │
│  ├── WhatsApp message from friend                                          │
│  ├── Social media post (Twitter, Instagram)                               │
│  ├── Email from colleague                                                  │
│  └── Blog post or newsletter                                               │
│                                                                             │
│  Example: "Check out this cool page: shopmatic.cc/@techguru/best-gadgets"   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: BROWSING (No Registration Required)                                │
│                                                                             │
│  LANDING ON COLLECTION PAGE                                                  │
│  ├── Hero: Curator's name and bio                                          │
│  ├── Collection title and description                                      │
│  ├── Product grid with images, prices, ratings                             │
│  ├── Each product card shows:                                              │
│  │     - Product image                                                     │
│  │     - Title (truncated)                                                 │
│  │     - Price                                                             │
│  │     - Rating (if available)                                             │
│  │     - "View Details" → expands inline                                   │
│  │     - "Get This" → goes directly to product URL                         │
│  └── Share buttons (WhatsApp, Twitter, Copy Link)                         │
│                                                                             │
│  Clicking "Get This":                                                       │
│  ├── Opens product page in new tab                                        │
│  ├── Tracked as a click (for curator analytics)                            │
│  └── No registration needed                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: ENGAGEMENT (Optional Registration)                                │
│                                                                             │
│  Registration offers:                                                        │
│  ├── "Share this collection with YOUR name attached"                       │
│  ├── "Create your own collections"                                         │
│  ├── "Get credit when friends buy through your shares"                     │
│  └── "Track your sharing impact"                                           │
│                                                                             │
│  REGISTER (/register?redirect=/share/...)                                  │
│  ├── Email + Password                                                       │
│  ├── Username (how you appear when sharing)                                │
│  └── Quick: "Continue with Google" (future)                                 │
│                                                                             │
│  After registration:                                                        │
│  ├── Can share ANY product/collection with their name                      │
│  ├── See "Shared by you" section in dashboard                              │
│  └── Track clicks on their shares                                           │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: SHARING (The Power Feature)                                       │
│                                                                             │
│  SHARE BUTTONS on every product and collection:                             │
│  ├── WhatsApp (direct message)                                            │
│  ├── Twitter/X                                                             │
│  ├── Facebook                                                              │
│  ├── LinkedIn                                                              │
│  ├── Copy Link (with auto-generatedUTM tracking)                          │
│  └── QR Code (for offline sharing)                                         │
│                                                                             │
│  When user shares:                                                          │
│  ├── Link includes tracking (UTM params + user ID if registered)          │
│  ├── Friends see "Shared by [Username]" badge                             │
│  ├── Sharer gets credit in analytics                                       │
│  └── Curator sees "Shared by @username" in their stats                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Buyer Journey (Just Want to Buy)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BUYER JOURNEY (Fastest Path)                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Click shared link → Lands on collection page                           │
│  2. Browse products (no registration)                                       │
│  3. Find product they like                                                 │
│  4. Click "Get This" → Goes directly to Amazon/Flipkart/etc.               │
│  5. Completes purchase on external site                                     │
│                                                                             │
│  That. Is. It.                                                              │
│                                                                             │
│  Optional (if they want to share themselves):                              │
│  6. Click "Share" → Prompted to register or continue anonymously          │
│  7. Register → Can now share with their name                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEW USER DISCOVERY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

[User finds Shopmatic via]
        │
        ├── Google Search (productivity/catalog tools)
        ├── Social Media (Twitter, LinkedIn, YouTube)
        ├── Word of Mouth (referrals)
        └── Content Marketing (blog posts, tutorials)
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LANDING PAGE (/)                                                            │
│  - Hero section explaining value proposition                                │
│  - Features showcase                                                         │
│  - Pricing plans                                                             │
│  - "Get Started Free" CTA                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIGNUP / REGISTRATION (/register)                                          │
│  - Email + Password                                                          │
│  - Or Demo Login (instant access)                                           │
│                                                                             │
│  Demo Mode: No account needed, sample data loaded                          │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ONBOARDING WIZARD (first-time users)                                       │
│  Step 1: Tell us about yourself (influencer, blogger, etc.)               │
│  Step 2: Import first products (URL extraction or manual)                  │
│  Step 3: Customize your storefront theme                                    │
│  Step 4: Connect affiliate IDs (optional)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD (/dashboard)                                                      │
│  - Overview stats (products, views, clicks)                                │
│  - Quick actions (add product, view page)                                   │
│  - Recent activity                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core User Flows

#### Flow A: Adding Products via AI Extraction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADD PRODUCT - AI EXTRACTION                              │
└─────────────────────────────────────────────────────────────────────────────┘

START: User is on Dashboard or My Products page
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Click "Add Product" → "Extract from URL"                                   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ENTER PRODUCT URL                                                          │
│  - Paste URL from Amazon, eBay, or any product page                         │
│  - Click "Extract"                                                          │
│                                                                             │
│  Validation: URL must be valid HTTP/HTTPS                                  │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AI PROCESSING (OpenAI GPT-4o-mini)                                         │
│  - Fetch HTML content from URL                                             │
│  - Extract: title, description, price, images, rating, specs               │
│  - Display confidence score                                                │
│                                                                             │
│  Loading State: "Extracting product details..."                            │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ├─── Success ─┤
        │             │
        ▼             ▼
┌──────────────┐  ┌─────────────────────────────────────────────────────────┐
│ SHOW PRODUCT │  │  REVIEW & EDIT EXTRACTED DATA                             │
│ PREVIEW      │  │  - Title (editable)                                       │
│              │  │  - Description (editable)                                 │
│              │  │  - Price & Currency (editable)                            │
│              │  │  - Images (add/remove)                                    │
│              │  │  - Category & Tags (select/add)                          │
│              │  │  - Affiliate URL (auto-generated with your ID)            │
└──────────────┘  └─────────────────────────────────────────────────────────┘
        │                         │
        │                         ▼
        │             ┌─────────────────────────────────────────────────────┐
        │             │  Click "Save Product"                                 │
        │             │  - Validates required fields                         │
        │             │  - Saves to localStorage                              │
        │             │  - Shows success toast                                 │
        │             └─────────────────────────────────────────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRODUCT SAVED → Redirect to My Products / Product Details                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Flow B: Creating and Sharing a Storefront Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CREATE & SHARE STOREFRONT PAGE                           │
└─────────────────────────────────────────────────────────────────────────────┘

START: User has products in their catalog
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CREATE NEW PAGE (/pages/new or via Dashboard)                              │
│  - Page Title (e.g., "My Tech Favorites 2026")                             │
│  - Page Description (SEO friendly)                                         │
│  - Select products to include                                              │
│  - Choose page visibility (Public/Private/Unlisted)                        │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CUSTOMIZE PAGE                                                             │
│  - Choose theme/colors                                                      │
│  - Add custom header/footer                                                │
│  - Configure affiliate disclosure                                          │
│  - Set up custom domain (Pro/Enterprise)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PREVIEW PAGE                                                               │
│  - Live preview of storefront                                              │
│  - Test affiliate link clicks                                              │
│  - Verify mobile responsiveness                                            │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PUBLISH PAGE                                                               │
│  - Page goes live at: yoursite.com/p/[page-slug]                           │
│  - Share buttons (Twitter, Facebook, LinkedIn, Email)                      │
│  - Copy link button                                                        │
│  - QR code generation                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ANALYTICS                                                                  │
│  - Track page views                                                         │
│  - Track product clicks                                                     │
│  - Affiliate link performance                                              │
│  - Visitor geography (if GA4 enabled)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Flow C: Team Collaboration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TEAM COLLABORATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

START: Page owner wants to invite team members
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACCESS PAGE SETTINGS → TEAM TAB                                            │
│  - View current team members                                               │
│  - See pending invitations                                                  │
│  - Check team limits (based on plan)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  INVITE TEAM MEMBER                                                        │
│  - Enter email address                                                     │
│  - Select role (Admin, Editor, Viewer)                                    │
│  - Click "Send Invitation"                                                 │
│                                                                             │
│  System generates secure token (32 chars, 7-day expiry)                     │
│  Invitation email sent via user's configured SMTP                         │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  INVITEE RECEIVES EMAIL                                                     │
│  - Contains invitation link with token                                     │
│  - Must log in to accept                                                    │
│  - Email must match invitation                                             │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACCEPT INVITATION                                                          │
│  - Click link → redirected to site                                         │
│  - If not logged in: login/register first                                  │
│  - Confirm acceptance                                                       │
│  - Added to page_collaborators with assigned role                          │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TEAM MEMBER CAN NOW:                                                       │
│  - Admin: Full page management (except delete)                            │
│  - Editor: Add/edit/delete products                                       │
│  - Viewer: View analytics only                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Authentication Flows

#### Registration
```
[Landing] → [Sign Up] → [Enter Email/Password] → [Verify Email*] → [Onboarding] → [Dashboard]
                                    ↓
                              [Demo Mode] → [Skip to Dashboard]
* Email verification pending implementation
```

#### Login
```
[Landing] → [Login] → [Enter Credentials] → [Success] → [Dashboard]
                    ↓
            [Demo Login] → [Instant Access]
                    ↓
            [Forgot Password] → [Email Reset Link]
```

#### Logout
```
[Header Profile] → [Logout] → [Clear Session] → [Redirect to Landing]
```

---

---

## 4. Page Structure & Navigation

### 4.1 Public Pages (No Login Required)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing/Index | Marketing page, signups |
| `/features` | Features | Product feature showcase |
| `/pricing` | Pricing | Plan comparison |
| `/about-us` | About | Company info |
| `/help-center` | Help | FAQs and support |
| `/@:username` | Curator Profile | Shows all collections by this curator |
| `/@:username/:collectionSlug` | Collection Page | Public shareable collection |
| `/p/:productId` | Product Detail | Standalone product (optional) |

### 4.2 Authenticated Pages (Login Required)

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard | Overview and stats |
| `/my-products` | My Products | Product catalog management |
| `/my-pages` | My Pages | Collection pages management |
| `/analytics` | Analytics | Performance tracking |
| `/shared` | Shared by Me | Track shares and impact |
| `/settings` | Settings | Account, SMTP, preferences |
| `/profile` | Profile | User profile, username, bio |
| `/affiliate-ids` | Affiliate IDs | Configure affiliate tracking |
| `/privacy-settings` | Privacy | Data export/delete, cookies |

### 4.3 Compliance Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/privacy-policy` | Privacy Policy | Legal |
| `/terms-of-service` | Terms | Legal |
| `/content-guidelines` | Content Guidelines | What can/cannot be shared |
| `/cookies` | Cookie Policy | GDPR compliance |

### 4.4 URL Structure

```
shopmatic.cc
├── /                              # Landing page
├── /@johndoe                      # John's public profile (all collections)
├── /@johndoe/tech-favorites       # John's "Tech Favorites" collection
├── /@johndoe/best-books-2026      # John's "Best Books 2026" collection
├── /dashboard                     # (Authenticated) John's dashboard
├── /my-products                   # (Authenticated) John's products
├── /my-pages                      # (Authenticated) John's collections
└── /settings                      # (Authenticated) John's settings
```

**Sharer URL Structure:**
```
When Sarah shares John's collection:
shopmatic.cc/@johndoe/tech-favorites?ref=sarah

When Sarah shares a product:
shopmatic.cc/product/abc123?ref=sarah
```

---

---

## 5. Core Features

### 5.1 Product Management

#### Adding Products (AI-Powered)
```
1. Click "Add Product"
2. Paste URL from ANY platform:
   - Amazon, Flipkart, eBay
   - AppSumo, ProductHunt
   - Direct product pages (any site)
3. AI extracts:
   ├── Title
   ├── Description
   ├── Price + Currency
   ├── Product Images
   ├── Rating
   └── Specifications
4. Review & Edit
5. Set Affiliate URL (auto-generates with your IDs)
6. Add to collection or keep standalone
```

#### Organizing Products
- **Collections**: Group products into shareable pages
- **Tags**: Add custom tags for filtering within your library
- **Sorting**: Newest, Price (low-high, high-low), Rating
- **View Modes**: Grid (visual) or List (compact)

### 5.2 Collection Pages

**What is a Collection?**
A curated list of products around a theme. Examples:
- "My Top 10 Tech Gadgets 2026"
- "Best Gifts for Mom"
- "Side Hustle Tools I Use"

**Creating a Collection:**
```
1. Go to My Pages → Create New
2. Name your collection (becomes URL slug)
3. Add products from your library
4. Customize appearance:
   ├── Theme colors
   ├── Header image/banner
   ├── Bio/about section
   └── Social links
5. Preview
6. Publish
```

**Collection URL:**
```
shopmatic.cc/@username/collection-slug
Example: shopmatic.cc/@techguru/best-gadgets-2026
```

### 5.3 Sharing & Tracking

#### For Curators
- Share collection links anywhere
- Track:
  - Page views
  - Product clicks
  - Traffic sources
  - Geography
  - Top performers

#### For Sharers
- Share products/collections with "Shared by @username" badge
- Track clicks on your shares
- Build reputation as trusted recommender

#### Share Destinations
- WhatsApp (primary - direct message)
- Twitter/X
- Facebook
- LinkedIn
- Email
- Copy link (with tracking)

### 5.4 Affiliate ID Management

**Purpose**: Automatically append affiliate IDs to product links when users click through

**Supported Networks:**
- Amazon Associates
- Flipkart Affiliate
- AppSumo
- ShareASale
- CJ Affiliate
- Custom/Generic

**Setup:**
1. Settings → Affiliate IDs
2. Add your affiliate IDs for each network
3. Set default network
4. Links auto-append IDs when clicked

### 5.5 Theme Customization

**For Collection Pages:**
- Primary color
- Background color
- Text colors
- Layout options (grid, list, carousel)
- Header image
- Custom bio section

**For Dashboard:**
- Dark/Light mode
- Dashboard theme (future)

### 5.6 Content Guidelines Enforcement

**Automated Checks:**
- URL validation (block known bad domains)
- Profanity filter on titles/descriptions
- Link to product validation

**Manual Review (if flagged):**
- Report system for users
- Admin review queue
- Appeal process

---

## 6. Plans & Limits

### 6.1 Free Plan (Generous to Attract)

| Feature | Limit |
|---------|-------|
| Products | 50 |
| Collections | 5 |
| Page Views | 10,000/month |
| Affiliate Networks | 2 |
| Custom Domain | ❌ |
| Team Members | 0 |
| Analytics Depth | Basic |
| Support | Community |

### 6.2 Pro Plan ($X/month)

| Feature | Limit |
|---------|-------|
| Products | 500 |
| Collections | 25 |
| Page Views | Unlimited |
| Affiliate Networks | 10 |
| Custom Domain | ✅ |
| Team Members | 3/collection |
| Analytics Depth | Advanced |
| Support | Email |

### 6.3 Enterprise Plan (Custom)

| Feature | Limit |
|---------|-------|
| Products | Unlimited |
| Collections | Unlimited |
| Page Views | Unlimited |
| Affiliate Networks | Unlimited |
| Custom Domain | ✅ |
| Team Members | Unlimited |
| Analytics Depth | Full + API |
| Support | Dedicated |

---

## 5. User Flows by Persona

### 5.1 New User - First Time Experience

```
Hour 0: Discovery
├── Land on Shopmatic.com
├── Read about features
├── Click "Get Started Free"
└── Register with email

Hour 0-1: Onboarding
├── Complete onboarding wizard
│   ├── Select role (influencer)
│   ├── Extract 3 products via AI
│   ├── Pick a theme
│   └── Connect one affiliate network
├── Arrive at Dashboard
└── See sample dashboard with stats

Hour 1-2: First Product Page
├── Create "Tech Favorites" page
├── Add 5 products from Amazon
├── Customize theme to match brand
├── Preview and publish
└── Share on Twitter

Day 1: Engagement
├── Check analytics
├── See 12 page views
├── See 3 product clicks
└── Receive email notification setup complete
```

### 5.2 Existing User - Daily Workflow

```
Morning: Check Stats
├── Login to Dashboard
├── Review yesterday's page views
├── Check affiliate link clicks
└── Compare with previous week

Mid-Day: Content Addition
├── Find new product online
├── Copy URL to Shopmatic
├── AI extracts product details
├── Edit description for audience
├── Add to existing page
└── Share update on social

Evening: Community
├── Check team activity (if applicable)
├── Review pending invitations
└── Respond to comments (external)
```

### 5.3 Team Owner - Management

```
Weekly: Team Review
├── Login to Dashboard
├── Navigate to page settings → Team
├── Review member activity log
├── Remove inactive members
├── Adjust roles if needed
└── Send new invitations for growth

Monthly: Audit
├── Review all collaborator permissions
├── Check invitation expiry
├── Update team limits if plan upgraded
└── Archive old projects/pages
```

---

## 6. Data Flow Architecture

### 6.1 Storage Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT-SIDE STORAGE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐
│ localStorage    │    │ localStorage    │    │ localStorage                │
│                 │    │                 │    │                             │
│ shopmatic-auth  │    │ shopmatic-      │    │ shopmatic-theme             │
│ (encrypted)     │    │ products        │    │                             │
│                 │    │                 │    │                             │
│ - Session token │    │ - Product list  │    │ - Theme preferences         │
│ - User data     │    │ - Categories    │    │ - Color settings            │
│ - Demo mode     │    │ - Custom cats   │    │                             │
└─────────────────┘    └─────────────────┘    └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Future)                                   │
└─────────────────────────────────────────────────────────────────────────────┘

NeonDB (PostgreSQL) ← REST API → Frontend

Tables:
- users (future)
- pages (future)
- page_collaborators (future)
- page_products (future)
- activity_log (future)

Currently: Frontend-only with localStorage
Backend: Auth endpoints, collaboration service
```

### 6.2 AI Product Extraction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AI PRODUCT EXTRACTION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

User pastes URL
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  URLParsingService.validateUrl()                                           │
│  - Check protocol (http/https only)                                        │
│  - Block dangerous protocols (javascript:, data:, etc.)                    │
└─────────────────────────────────────────────────────────────────────────────┘
        │ Valid
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  URLParsingService.fetchHtml()                                              │
│  - Fetch HTML from URL (with timeout)                                     │
│  - Extract first 4000 chars for analysis                                  │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OpenAIService.extractProduct()                                             │
│  - Send HTML content to GPT-4o-mini                                        │
│  - Prompt: Extract structured product data                                │
│  - Returns: { title, price, description, images, rating, etc. }           │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ├─── Success (confidence > 0.5) ─┐
        │                                 │
        │                                 ▼
        │              ┌─────────────────────────────────────┐
        │              │ Display extracted data for review   │
        │              │ User can edit before saving         │
        │              └─────────────────────────────────────┘
        │
        └─── Low Confidence/Failure ─┤
                                     │
                                     ▼
                    ┌─────────────────────────────────────┐
                    │ Show error: "Couldn't extract..."   │
                    │ Offer manual entry fallback          │
                     └─────────────────────────────────────┘
```

### 6.3 Click Tracking Flow

```
User clicks product on collection page
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND: Capture click data                                                │
│  ├── product_id, collection_id, curator_id                                  │
│  ├── referrer, UTM params                                                   │
│  ├── timestamp, device info                                                  │
│  ├── sharer_id (from ref param if present)                                 │
│  └── Send to tracking endpoint (async, don't block navigation)             │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ANALYTICS: Aggregate for curator                                          │
│  ├── Product clicks (by collection and product)                            │
│  ├── Traffic sources (direct, social, search)                              │
│  ├── Geography                                                             │
│  ├── Sharer attribution (if ref param present)                             │
│  └── Time-based trends                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FOR SHARER: Track their impact                                            │
│  ├── When ref param present → link click to sharer's account              │
│  ├── Sharer sees "Your shares led to X clicks"                             │
│  └── Curator sees "Shared by @username" in attribution                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Current Implementation Status

### 7.1 Completed Features ✅

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ Done | Email/password, demo mode |
| User Login | ✅ Done | Session management, encrypted |
| Demo Mode | ✅ Done | Instant access, sample data |
| Product CRUD | ✅ Done | Add, edit, delete products |
| AI Extraction | ✅ Done | GPT-4o-mini integration |
| Product Filtering | ✅ Done | Categories, tags, price, rating |
| Theme Customization | ✅ Done | Real-time preview |
| Affiliate ID Management | ✅ Done | Per-network configuration |
| Page Creation | ✅ Done | Basic pages with products |
| Page Sharing | ✅ Done | Public URLs |
| Cookie Consent | ✅ Done | GDPR compliant |
| Privacy Settings | ✅ Done | Data export/delete |
| Security Headers | ✅ Done | CSP, X-Frame-Options, etc. |
| API Key Encryption | ✅ Done | AES-GCM encryption |

### 7.2 In Progress / Partial Features 🔄

| Feature | Status | Notes |
|---------|--------|-------|
| Team Collaboration | 🔄 Partial | Backend endpoints exist, UI ready |
| SMTP Configuration | 🔄 Partial | UI complete, email sending untested |
| Analytics Dashboard | 🔄 Partial | Basic stats, GA4 integration pending |
| Backend Database | 🔄 Partial | Schema exists, migration in progress |
| Sharer Attribution | 🔄 Planned | ref params, share tracking, attribution display |
| Content Guidelines | 🔄 Planned | No unethical/illegal products enforcement |
| WhatsApp Sharing | 🔄 Planned | Direct WhatsApp share with tracking |

### 7.3 Planned Features 📋

| Feature | Priority | Notes |
|---------|----------|-------|
| Email Verification | High | Registration confirmation |
| Password Reset | High | Email-based reset flow |
| Sharer Dashboard | High | Track "shared by you" clicks |
| Content Guidelines | High | Block unethical/illegal products |
| Social Login | Medium | Google, GitHub OAuth |
| Bulk Product Import | Medium | CSV import |
| Custom Domain | Medium | Per-page domains (Pro+) |
| Mobile App | Low | React Native (future) |
| API Access | Low | Third-party integrations |

### 7.4 Plan Limits (to implement)

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Products | 50 | 500 | Unlimited |
| Collections | 5 | 25 | Unlimited |
| Page Views/mo | 10K | Unlimited | Unlimited |
| Affiliate Networks | 2 | 10 | Unlimited |
| Custom Domain | ❌ | ✅ | ✅ |
| Team Members | 0 | 3/collection | Unlimited |
| Sharer Attribution | Basic | Advanced | Full |
| API Access | ❌ | ❌ | ✅ |

---

## 8. Corrections Needed → See PHASES.md

**Detailed implementation plan with tasks, testing, and progress tracking available in `docs/PHASES.md`.**

### Quick Summary of Issues

### 8.1 Critical Gaps (Phase 1)

| Issue | Impact | Task Reference |
|-------|--------|----------------|
| Email Verification Missing | Users can register but never verify | Task 1.1 |
| Public Page OG Tags | No social media previews | Task 1.2 |
| Password Reset Incomplete | Users can't recover accounts | Task 1.3 |
| Onboarding Wizard | May not be fully integrated | Task 1.4 |
| Session Expiry | No graceful handling | Task 1.5 |
| Sharer Attribution | Can't track who shared what | Task 1.NEW |
| Content Guidelines | No enforcement of product rules | Task 1.NEW |

### 8.2 User Experience (Phase 2)

| Issue | Impact | Task Reference |
|-------|--------|----------------|
| Empty States | No guidance for new users | Task 2.1 |
| Loading States | jarring content shifts | Task 2.2 |
| Toast Messages | Poor feedback | Task 2.3 |
| Form Validation | Confusing errors | Task 2.4 |
| Confirmation Dialogs | Accidental deletions | Task 2.5 |
| WhatsApp Direct Share | Can't share directly to WhatsApp | Task 2.NEW |

### 8.3 Accessibility (Phase 3)

| Issue | Impact | Task Reference |
|-------|--------|----------------|
| Skip Links | Keyboard users can't skip nav | Task 3.1 |
| Breadcrumbs | Hard to navigate deep pages | Task 3.2 |
| Command Palette | No quick search/navigation | Task 3.3 |
| Focus Management | Confusing keyboard nav | Task 3.4 |
| ARIA Labels | Screen reader issues | Task 3.5 |

---

## 9. Testing Checklist

### 9.1 Happy Path Tests

- [ ] New user can register and login
- [ ] Demo mode works without registration
- [ ] AI product extraction returns valid data
- [ ] Products persist after page refresh
- [ ] Theme changes apply immediately
- [ ] Public pages load for anonymous users
- [ ] Affiliate IDs append to links correctly
- [ ] Cookie consent appears and saves preferences

### 9.2 Edge Case Tests

- [ ] Invalid URL in product extraction shows error
- [ ] Empty product catalog shows empty state
- [ ] Very long product titles truncate properly
- [ ] Special characters in names don't break anything
- [ ] Offline mode shows appropriate message
- [ ] Session expiry redirects to login

### 9.3 Team Collaboration Tests

- [ ] Owner can invite member via email
- [ ] Member receives invitation link
- [ ] Member can accept invitation and see page
- [ ] Editor can add/edit products
- [ ] Viewer cannot add products (button hidden)
- [ ] Owner can remove member
- [ ] Invitation expires after 7 days

---

## 10. Appendix

### 10.1 User Role Definitions

| Role | Description |
|------|-------------|
| **Platform Admin** | Shopmatic staff, access to all |
| **Affiliate Marketer** | Content creator, creates pages/products |
| **End User** | Anonymous visitor, browses public pages |

### 10.2 Page Role Definitions

| Role | Permissions |
|------|-------------|
| **Owner** | Full control including delete |
| **Admin** | Manage all except delete |
| **Editor** | Manage products only |
| **Viewer** | View analytics only |

### 10.3 Plan Limits

| Plan | Team Members | Custom Domain | API Access |
|------|--------------|---------------|------------|
| Free | 0 | ❌ | ❌ |
| Pro | 3/page | ❌ | ❌ |
| Enterprise | Unlimited | ✅ | ✅ |

---

**Document Status**: Ready for Review  
**Next Steps**: Review corrections section, prioritize fixes, update roadmap

---

## 11. Implementation Phases

Detailed implementation plan is documented in `docs/PHASES.md`.

### Quick Reference

| Phase | Focus | Tasks | Priority |
|-------|-------|-------|----------|
| **Phase 1** | Critical Fixes | Email verification, OG tags, password reset, session handling | HIGH |
| **Phase 2** | UX Improvements | Empty states, loading skeletons, toasts, form validation, dialogs | MEDIUM |
| **Phase 3** | Accessibility | Skip links, breadcrumbs, Cmd+K search, focus management, ARIA | MEDIUM |
| **Phase 4** | Polish | Bundle optimization, error boundary, performance monitoring, E2E tests | LOW |

### Progress

| Phase | Status | Completed | Total |
|-------|--------|-----------|-------|
| Phase 1 | 🔄 In Progress | 0 | 8 |
| Phase 2 | ⏳ Pending | 0 | 6 |
| Phase 3 | ⏳ Pending | 0 | 5 |
| Phase 4 | ⏳ Pending | 0 | 4 |

### Current Sprint: Phase 1

**Next Task**: Task 1.2 - Public Page Open Graph Tags

**Why**: Without OG tags, shared pages show no preview on social media, hurting discoverability.

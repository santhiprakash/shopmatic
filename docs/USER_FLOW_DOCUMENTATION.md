# eComJunction User Flow Documentation

**Document Version:** 1.0  
**Last Updated:** 2026-04-03  
**Status:** Draft - For Review

---

## 1. Product Overview

### 1.1 What is eComJunction?

eComJunction is a SAAS platform that helps **influencers and affiliate marketers** organize, showcase, and share product recommendations with their audience. It combines AI-powered product extraction with beautiful, customizable storefronts.

### 1.2 Core Value Proposition

| User Need | How eComJunction Addresses It |
|-----------|-------------------------------|
| "I find products online but can't easily organize them" | AI extracts product details from any URL |
| "I want to share my recommendations professionally" | Beautiful, shareable storefronts with themes |
| "I need to track my affiliate links" | Built-in affiliate ID management |
| "I work with a team" | Collaboration features with role-based access |
| "I need my page to look professional" | Customizable themes and branding |

### 1.3 Target Users

1. **Affiliate Marketers** - Promote products and earn commissions
2. **Influencers** - Curate product collections for followers
3. **Content Creators** - Organize product reviews and recommendations
4. **Niche Bloggers** - Create product comparison pages

---

## 2. User Journey

### 2.1 Discovery & Signup Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEW USER DISCOVERY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

[User finds eComJunction via]
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

## 3. Page Structure & Navigation

### 3.1 Public Pages (No Login Required)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing/Index | Marketing page, signups |
| `/features` | Features | Product feature showcase |
| `/pricing` | Pricing | Plan comparison |
| `/about-us` | About | Company info |
| `/help-center` | Help | FAQs and support |
| `/p/:slug` | Public Page | User's storefront (shareable) |

### 3.2 Authenticated Pages (Login Required)

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard | Overview and stats |
| `/my-products` | My Products | Product catalog management |
| `/analytics` | Analytics | Performance tracking |
| `/settings` | Settings | Account, SMTP, preferences |
| `/profile` | Profile | User profile management |
| `/privacy-settings` | Privacy | Data export/delete, cookies |

### 3.3 Compliance Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/privacy-policy` | Privacy Policy | Legal |
| `/terms-of-service` | Terms | Legal |
| `/cookies` | Cookie Policy | GDPR compliance |

---

## 4. Feature walkthrough

### 4.1 Product Management

#### Adding Products
1. **Manual Entry**: Click "Add Product" → Fill form (title, price, description, images, category, tags)
2. **AI Extraction**: Paste URL → AI extracts data automatically
3. **Import**: Bulk import via CSV (future feature)

#### Organizing Products
- **Categories**: Group products by type (e.g., "Electronics", "Fashion")
- **Tags**: Add custom tags for filtering
- **Sorting**: Newest, Price (low-high, high-low), Rating
- **View Modes**: Grid (visual) or List (compact)

#### Filtering Products
- By category
- By tag
- By price range (slider)
- By minimum rating
- Combined filters with "Clear All"

### 4.2 Theme Customization

**Accessible from**: Dashboard (theme button) or Settings

**Customization Options**:
- Primary color (picker with presets)
- Background color
- Text colors
- Accent color
- Border radius style

**Preview**: Real-time preview as you customize

**Persistence**: Saved to localStorage, applied on page load

### 4.3 Affiliate ID Management

**Purpose**: Automatically append affiliate IDs to product links

**Setup**:
1. Go to Settings → Affiliate IDs
2. Add IDs for each network:
   - Amazon Associates
   - ShareASale
   - CJ Affiliate
   - Custom networks
3. Set default network
4. Links auto-append IDs when copied

### 4.4 Email Configuration

**Purpose**: Send team invitations and notifications

**Supported Providers**:
- EmailIT (default)
- Resend
- SendGrid
- Custom SMTP

**Setup**: Settings → SMTP Configuration → Enter credentials

---

## 5. User Flows by Persona

### 5.1 New User - First Time Experience

```
Hour 0: Discovery
├── Land on eComJunction.com
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
├── Copy URL to eComJunction
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

### 7.3 Planned Features 📋

| Feature | Priority | Notes |
|---------|----------|-------|
| Email Verification | High | Registration confirmation |
| Password Reset | High | Email-based reset flow |
| Social Login | Medium | Google, GitHub OAuth |
| Bulk Product Import | Medium | CSV import |
| Custom Domain | Medium | Per-page domains |
| Mobile App | Low | React Native (future) |
| API Access | Low | Third-party integrations |

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

### 8.2 User Experience (Phase 2)

| Issue | Impact | Task Reference |
|-------|--------|----------------|
| Empty States | No guidance for new users | Task 2.1 |
| Loading States | jarring content shifts | Task 2.2 |
| Toast Messages | Poor feedback | Task 2.3 |
| Form Validation | Confusing errors | Task 2.4 |
| Confirmation Dialogs | Accidental deletions | Task 2.5 |

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
| **Platform Admin** | eComJunction staff, access to all |
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

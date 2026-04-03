# eComJunction Implementation Phases

**Document Version:** 1.0  
**Created:** 2026-04-03  
**Last Updated:** 2026-04-03  

---

## Overview

This document outlines the phased implementation plan for addressing the corrections identified in `USER_FLOW_DOCUMENTATION.md`. Each phase contains specific tasks with acceptance criteria and testing requirements.

---

## Progress Summary

| Phase | Name | Priority | Status | Tasks | Completed |
|-------|------|----------|--------|-------|-----------|
| 1 | Critical Fixes | HIGH | 🔄 In Progress | 10 | 6/10 |
| 1S | Security Fixes | HIGH | 🔄 Completed | 5 | 2/5 |
| 2 | UX Improvements | MEDIUM | ⏳ Pending | 7 | 0/7 |
| 3 | Accessibility | MEDIUM | ⏳ Pending | 5 | 0/5 |
| 4 | Polish & Performance | LOW | ⏳ Pending | 4 | 0/4 |

---

## Phase 1: Critical Fixes 🔄

**Priority:** HIGH  
**Target:** Before next release  
**Goal:** Fix incomplete user flows and broken sharing

### Task 1.1: Email Verification System

**Files to Modify:**
- `src/components/auth/AuthContext.tsx`
- `src/pages/Register.tsx`
- `src/pages/Login.tsx`
- `server/src/routes/auth.ts` (if backend exists)

**Tasks:**
- [ ] Add email verification step to registration
- [ ] Create verification email template
- [ ] Add email verification token generation/validation
- [ ] Block login until email verified (optional setting)
- [ ] Add resend verification email functionality
- [ ] Add "Verify Email" page with token handling

**Acceptance Criteria:**
- [ ] New user receives verification email after registration
- [ ] Clicking verification link marks email as verified
- [ ] Unverified users see prompt to verify
- [ ] Verification link expires after 24 hours
- [ ] Can resend verification email

**Testing:**
```
1. Register new user → verify email received
2. Click verification link → email marked verified
3. Attempt login with unverified account → appropriate message
4. Resend verification → new email received
5. Expired token → appropriate error message
```

---

### Task 1.2: Public Page Open Graph Tags ✅ COMPLETED

**Date Completed:** 2026-04-03

**Files Created:**
- `src/pages/PublicPage.tsx` - New public collection page component

**Files Modified:**
- `src/App.tsx` - Added routes for `/@:username` and `/@:username/:collectionSlug`
- `index.html` - Added og:image, og:site_name, twitter:site, twitter:image

**Implementation:**
- Created `PublicPage` component with dynamic OG meta tags
- Routes: `/@:username` (profile) and `/@:username/:collectionSlug` (collection)
- Dynamic meta tags based on username and collection data
- Share buttons for WhatsApp, Twitter, Facebook, LinkedIn, Copy Link
- Includes `PublicPageMeta` component for SEO meta tags

**Meta Tags Added:**
```html
<!-- Open Graph -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="website|profile" />
<meta property="og:site_name" content="shopmatic.cc" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
<meta name="twitter:site" content="@shopmatic_cc" />
<meta name="twitter:creator" content="@username" />
```

**Testing Required:**
```
1. Deploy to production
2. Use Facebook Sharing Debugger → scrape URL
3. Verify preview shows correct title, description, image
4. Test on Twitter → verify card renders
5. Test on LinkedIn → verify preview
```

---

### Task 1.3: Password Reset Flow

**Files to Modify:**
- `src/components/auth/ForgotPassword.tsx`
- `src/components/auth/ResetPassword.tsx`
- `server/src/routes/auth.ts`

**Tasks:**
- [ ] Create Forgot Password page
- [ ] Create Reset Password page with token
- [ ] Implement token generation and email sending
- [ ] Add token validation (1 hour expiry)
- [ ] Add success/error states

**Acceptance Criteria:**
- [ ] User can request password reset via email
- [ ] Reset link sent to registered email
- [ ] Token valid for 1 hour
- [ ] Password updated after valid token
- [ ] Invalid/expired token shows error

**Testing:**
```
1. Click "Forgot Password" → enter email
2. Receive reset email with link
3. Click link → land on reset page
4. Enter new password → password updated
5. Login with new password → success
6. Use expired token → error message
```

**Note:** AuthModal already has forgot password form. Created standalone pages at:
- `/forgot-password` - Standalone forgot password page
- `/reset-password?token=xxx` - Standalone reset password page

---

### Task 1.3: Password Reset Flow ✅ COMPLETED

**Date Completed:** 2026-04-03

**Files Created:**
- `src/pages/ForgotPassword.tsx` - Standalone forgot password page
- `src/pages/ResetPassword.tsx` - Standalone reset password page

**Files Modified:**
- `src/App.tsx` - Added `/forgot-password` and `/reset-password` routes

**Implementation:**
- ForgotPassword page with email input
- ResetPassword page with token validation
- Password strength validation (8+ chars, upper/lower/number)
- Backend already implemented at `/api/auth/forgot-password` and `/api/auth/reset-password`

**Testing:**
```
1. Click "Forgot password?" in AuthModal → modal opens with reset form
2. Or visit /forgot-password directly
3. Enter email → success message shown
4. Click reset link from email → /reset-password?token=xxx
5. Enter new password → success
6. Login with new password → works
```

---

### Task 1.4: Onboarding Wizard Integration ✅ COMPLETED

**Date Completed:** 2026-04-03

**Status:** Already fully implemented

**Files Verified:**
- `src/components/onboarding/OnboardingWizard.tsx` - Main wizard component
- `src/hooks/use-onboarding.ts` - State management hook
- `src/components/onboarding/WelcomeStep.tsx`
- `src/components/onboarding/ProfileSetupStep.tsx`
- `src/components/onboarding/AffiliateSetupStep.tsx`
- `src/components/onboarding/FirstProductStep.tsx`
- `src/components/onboarding/ThemeCustomizationStep.tsx`

**Implementation:**
- 5-step wizard (Welcome, Profile, Affiliate IDs, First Product, Theme)
- Progress persisted in localStorage
- Can skip or complete onboarding
- Shows for authenticated users only
- Doesn't show for demo mode users

---

### Task 1.5: Session Expiry Handling ✅ COMPLETED

**Date Completed:** 2026-04-03

**Files Modified:**
- `src/contexts/AuthContext.tsx`

**Implementation:**
- Session duration: 24 hours (SESSION_DURATION constant)
- Checks session expiry on app load
- Shows "Session expired. Please log in again." toast when session expires
- Removes expired session from localStorage
- Redirects to login via ProtectedRoute

**Testing:**
```
1. Login → session stored with 24hr expiry
2. Wait/simulate 24 hours → session expires
3. Attempt page access → toast shows "Session expired"
4. Redirect to login → user logs in again
```

---

### Task 1.6: Invalid URL Error Handling ✅ COMPLETED

**Date Completed:** 2026-04-03

**Files Verified:**
- `src/components/products/ProductCard.tsx` - URL validation on links
- `src/components/products/ProductTable.tsx` - URL validation before window.open
- `src/components/profile/SocialMediaDisplay.tsx` - URL validation on social links
- `src/utils/security.ts` - SecurityUtils.validateUrl()

**Implementation:**
- All external links validated before rendering/opening
- `javascript:`, `data:`, `file:`, `ftp:` protocols blocked
- Invalid links replaced with `#` and clicks prevented
- User-friendly error handling

**Testing:**
```
1. Try to add product with javascript: URL → validation error
2. Try to open invalid link → prevented, no action
3. Valid URLs → open correctly in new tab
```

---

### Task 1.7: Product Image Fallback ✅ COMPLETED

**Date Completed:** 2026-04-03

**Files Modified:**
- `src/components/products/ProductCard.tsx`

**Implementation:**
- Added onError handler for product images
- Falls back to `/placeholder.svg` when image fails to load
- Works for Amazon images, custom URLs, any product image

**Testing:**
```
1. Add product with invalid image URL → placeholder shown
2. Amazon image 404 → placeholder shown
3. Valid image loads → shows correctly
```

**Files to Modify:**
- `src/contexts/AuthContext.tsx`
- `src/components/auth/ProtectedRoute.tsx`

**Tasks:**
- [ ] Implement 24-hour session expiry check
- [ ] Redirect to login on session expiry
- [ ] Show "Session expired" message
- [ ] Preserve current URL for post-login redirect

**Acceptance Criteria:**
- [ ] Session expires after 24 hours
- [ ] Expired session redirects to login
- [ ] User sees "session expired" message
- [ ] User redirected back after re-login

**Testing:**
```
1. Login → verify session starts
2. Wait/simulate 24 hours → session expires
3. Attempt page access → redirect to login
4. See "session expired" message
5. Login again → redirect to original page
```

---

### Task 1.6: Invalid URL Error Handling

**Files to Modify:**
- `src/components/products/AddProductForm.tsx`
- `src/services/URLParsingService.ts`

**Tasks:**
- [ ] Show user-friendly error for invalid URLs
- [ ] Show user-friendly error when URL fetch fails
- [ ] Show user-friendly error for blocked sites
- [ ] Provide manual entry fallback

**Acceptance Criteria:**
- [ ] Invalid URL shows "Please enter a valid URL"
- [ ] Fetch failure shows "Could not reach this page"
- [ ] Blocked protocols show appropriate message
- [ ] "Enter manually" option always available

**Testing:**
```
1. Enter "not-a-url" → validation error
2. Enter "https://blocked-site.com" → appropriate error
3. Enter URL with no content → graceful error
4. Click "Enter manually" → form appears
```

---

### Task 1.7: Product Image Fallback

**Files to Modify:**
- `src/components/products/ProductCard.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/types/index.ts`

**Tasks:**
- [ ] Add placeholder image for products without images
- [ ] Handle image load errors gracefully
- [ ] Show product-specific placeholder (category icon?)

**Acceptance Criteria:**
- [ ] Products without images show placeholder
- [ ] Failed image loads show placeholder
- [ ] No broken image icons visible

**Testing:**
```
1. Add product without image → placeholder shown
2. Add product with invalid image URL → placeholder shown
3. Image fails to load → placeholder shown
4. Verify all products in grid show valid images or placeholders
```

---

### Task 1.8: Backend API Error Handling

**Files to Modify:**
- `src/services/CollaborationService.ts`
- `src/services/EmailServiceNew.ts`
- `src/lib/neondb.ts`

**Tasks:**
- [ ] Add proper error handling for API failures
- [ ] Show user-friendly error messages
- [ ] Implement retry logic for transient failures
- [ ] Log errors for debugging

**Acceptance Criteria:**
- [ ] Network errors show "Connection error, please try again"
- [ ] Server errors show "Something went wrong"
- [ ] 401 errors redirect to login
- [ ] Errors logged to console in development

**Testing:**
```
1. Disconnect network → appropriate offline message
2. Server returns 500 → "Something went wrong"
3. Server returns 401 → redirect to login
4. Retry transient failure → succeeds
```

---

### Task 1.9: Sharer Attribution System

**Files to Create:**
- `src/utils/shareTracking.ts`
- `src/components/share/ShareButtons.tsx`
- `src/pages/SharedByMe.tsx`

**Files to Modify:**
- `src/components/products/ProductCard.tsx`
- `src/components/products/CollectionCard.tsx`
- `src/pages/CollectionPage.tsx`
- `src/App.tsx`

**Tasks:**
- [ ] Create share URL generator with ref params
- [ ] Implement ref param capture on page load
- [ ] Store sharer attribution in backend
- [ ] Create "Shared by Me" dashboard page
- [ ] Display "Shared by @username" on collection pages
- [ ] Track clicks per sharer

**Acceptance Criteria:**
- [ ] Share URLs include `?ref=username&src=whatsapp|twitter|etc`
- [ ] Sharer can see their share links and click counts
- [ ] Collection owner sees "Shared by @sarah (X clicks)" attribution
- [ ] Works for both products and collections

**Testing:**
```
1. Share collection → copy link with ref params
2. Open shared link in incognito → click recorded with ref
3. Check sharer dashboard → shows 1 click
4. Check curator analytics → shows "Shared by [sharer]"
5. Test WhatsApp, Twitter, copy link sources
```

---

### Task 1.10: Content Guidelines Enforcement

**Files to Create:**
- `src/utils/contentModeration.ts`
- `src/components/admin/ContentReview.tsx`

**Files to Modify:**
- `src/components/products/AddProductForm.tsx`
- `src/services/ProductService.ts`
- `server/src/routes/products.ts`
- `docs/CONTENT_GUIDELINES.md`

**Tasks:**
- [ ] Create content guidelines document
- [ ] Implement URL blocklist (known bad domains)
- [ ] Add profanity filter on titles/descriptions
- [ ] Create report button for users
- [ ] Add admin review queue (future)

**Content Guidelines:**
```
ALLOWED:
- Physical products (electronics, fashion, home)
- Digital products (courses, software, ebooks)
- Subscriptions (SaaS, memberships)
- Products from any platform (Amazon, Flipkart, AppSumo)

NOT ALLOWED:
- Illegal products or services
- Counterfeit goods
- Hate/violence promoting products
- Adult content (without age verification)
- Fraudulent/misleading products
- Products violating source platform terms
```

**Acceptance Criteria:**
- [ ] Blocklist domains rejected with clear message
- [ ] Profanity in titles shows warning
- [ ] Report button visible on products
- [ ] Guidelines accessible from footer/registration

**Testing:**
```
1. Add product from blocked domain → rejection message
2. Add product with profanity in title → warning shown
3. Click "Report" on product → report submitted
4. Find content guidelines in footer → readable
```

---

## Phase 1S: Security Fixes 🔄

**Priority:** HIGH  
**Target:** Immediate  
**Goal:** Fix critical security vulnerabilities

### Task 1S.1: XSS in Product Links ✅ FIXED

**Fixed:** 2026-04-03  
**File:** `src/components/products/ProductCard.tsx`

**Issue:** Product links rendered without URL validation, allowing XSS via `javascript:` URLs.

**Fix:** Added `SecurityUtils.validateUrl()` check before rendering links. Invalid URLs replaced with `#`.

---

### Task 1S.2: XSS in Social Media URLs ✅ FIXED

**Fixed:** 2026-04-03  
**File:** `src/components/profile/SocialMediaDisplay.tsx`

**Issue:** Social media URLs rendered without validation, allowing XSS via `javascript:` URLs.

**Fix:** Added `getSafeUrl()` helper using `SecurityUtils.validateUrl()`. Invalid URLs replaced with `#`.

---

### Task 1S.3: Auth Rate Limiting ✅ FIXED

**Fixed:** 2026-04-03  
**File:** `server/src/routes/auth.ts`

**Issue:** No rate limiting on login, register, forgot-password endpoints.

**Fix:** Added three rate limiters:
- `authRateLimiter`: 10 login attempts per 15 minutes
- `registrationRateLimiter`: 5 registrations per hour
- `forgotPasswordRateLimiter`: 3 reset requests per hour

---

### Task 1S.4: CSRF Token Implementation

**Priority:** HIGH  
**Files:** `src/utils/security.ts`, `server/src/middleware/csrf.ts` (create)

**Tasks:**
- [ ] Create CSRF token generation utility
- [ ] Create CSRF validation middleware for backend
- [ ] Add CSRF token to all state-changing forms
- [ ] Validate CSRF token on all POST/PATCH/DELETE requests

**Acceptance Criteria:**
- [ ] CSRF tokens generated for each session
- [ ] Tokens validated on all state-changing API calls
- [ ] Invalid tokens rejected with 403 response
- [ ] Tokens rotated on login/logout

**Testing:**
```
1. Submit form without CSRF token → 403 error
2. Submit form with invalid token → 403 error
3. Submit form with valid token → success
4. Login/logout → new token generated
```

---

### Task 1S.5: IDOR Protection for Page Endpoints

**Priority:** HIGH  
**Files:** `server/src/routes/pages.ts`

**Tasks:**
- [ ] Add authorization check to GET /pages/:id
- [ ] Add authorization check to GET /pages/slug/:slug
- [ ] Add authorization check to GET /pages/:id/products
- [ ] Verify user owns or collaborates on page before returning data

**Acceptance Criteria:**
- [ ] Users can only access their own pages
- [ ] Collaborators can access pages they have access to
- [ ] Attempting to access other users' pages returns 403
- [ ] Public pages accessible but analytics hidden

**Testing:**
```
1. Create page as user A → accessible by user A
2. Login as user B → try to access user A's page → 403
3. Add user B as collaborator → now accessible
4. Public page accessible but analytics shows ownership
```

---

### Task 1S.6: DOMPurify Integration

**Priority:** MEDIUM  
**Files:** `src/utils/security.ts`

**Tasks:**
- [ ] Install DOMPurify
- [ ] Replace regex sanitization with DOMPurify
- [ ] Apply DOMPurify to all HTML rendering

**Acceptance Criteria:**
- [ ] DOMPurify used for all HTML sanitization
- [ ] XSS payloads neutralized
- [ ] No regex-based sanitization for HTML

**Testing:**
```
1. Try XSS payloads → sanitized/neutralized
2. DOMPurify used for product descriptions
3. DOMPurify used for social media bio
```

---

## Phase 2: UX Improvements ⏳

**Priority:** MEDIUM  
**Target:** Phase 1 + 1 week  
**Goal:** Improve user experience with better feedback

### Task 2.1: Empty States

**Files to Modify:**
- `src/pages/Dashboard.tsx`
- `src/pages/MyProducts.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/pages/Analytics.tsx`

**Tasks:**
- [ ] Design empty state for empty dashboard
- [ ] Design empty state for no products
- [ ] Design empty state for no analytics data
- [ ] Add "Add First Product" CTA in empty states
- [ ] Add helpful illustrations/icons

**Acceptance Criteria:**
- [ ] Empty dashboard shows encouraging message
- [ ] Empty products page shows "Add your first product"
- [ ] Empty analytics shows "No data yet"
- [ ] Each empty state has clear CTA

**Testing:**
```
1. Clear all products → empty state appears
2. New user with no activity → dashboard empty state
3. Click CTA → navigates to add product
4. Verify illustrations load correctly
```

---

### Task 2.2: Loading States & Skeletons

**Files to Modify:**
- `src/components/products/ProductGrid.tsx`
- `src/components/products/ProductCard.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/MyProducts.tsx`

**Tasks:**
- [ ] Add skeleton loader for product grid
- [ ] Add skeleton loader for dashboard stats
- [ ] Add skeleton loader for page content
- [ ] Implement Suspense boundaries

**Acceptance Criteria:**
- [ ] Products show skeleton while loading
- [ ] Dashboard shows skeleton while loading
- [ ] No layout shift when content loads
- [ ] Skeletons match actual content shape

**Testing:**
```
1. Throttle network → skeletons appear
2. Verify skeletons match content layout
3. No visible layout shift when content loads
4. Skeletons disappear after content loads
```

---

### Task 2.3: Toast Notifications Polish

**Files to Modify:**
- `src/components/ui/toaster.tsx` (if customized)
- Throughout components using toast

**Tasks:**
- [ ] Review all toast messages for consistency
- [ ] Add action buttons to relevant toasts
- [ ] Implement toast for important actions (save, delete)
- [ ] Add undo functionality where applicable

**Acceptance Criteria:**
- [ ] All user actions show confirmation toast
- [ ] Errors show error toast with message
- [ ] Important actions have undo option
- [ ] Toast auto-dismiss after 5 seconds

**Testing:**
```
1. Add product → success toast appears
2. Delete product → confirm + undo option
3. Network error → error toast with message
4. Verify toast disappears after 5 seconds
5. Click toast action → executes action
```

---

### Task 2.4: Form Validation UX

**Files to Modify:**
- `src/components/products/AddProductForm.tsx`
- `src/components/auth/Register.tsx`
- `src/components/auth/Login.tsx`

**Tasks:**
- [ ] Show inline validation errors
- [ ] Validate on blur, not just on submit
- [ ] Show success checkmark for valid fields
- [ ] Disable submit until form valid

**Acceptance Criteria:**
- [ ] Invalid fields show red border + message
- [ ] Valid fields show green checkmark
- [ ] Submit disabled until form valid
- [ ] Focus moves to first error on submit

**Testing:**
```
1. Blur empty required field → validation error
2. Enter valid email → green checkmark
3. Submit invalid form → errors shown, no submission
4. Fix errors → submit enabled
5. Submit valid form → success
```

---

### Task 2.5: Confirmation Dialogs

**Files to Modify:**
- `src/components/products/ProductCard.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/pages/Settings.tsx`

**Tasks:**
- [ ] Add confirmation for destructive actions (delete)
- [ ] Customize dialog text for each context
- [ ] Show warning for bulk operations
- [ ] Support keyboard (Enter = confirm, Esc = cancel)

**Acceptance Criteria:**
- [ ] Delete product shows confirmation dialog
- [ ] Bulk delete shows warning with count
- [ ] Dialog keyboard accessible
- [ ] Clear action labels ("Delete Product" not just "OK")

**Testing:**
```
1. Click delete product → confirmation appears
2. Read dialog text → clear and specific
3. Press Enter → action executes
4. Press Escape → dialog closes, no action
5. Click outside → dialog closes
```

---

### Task 2.6: Onboarding Tooltips

**Files to Modify:**
- `src/components/onboarding/OnboardingTooltip.tsx` (create if not exists)
- `src/pages/Dashboard.tsx`
- `src/pages/MyProducts.tsx`

**Tasks:**
- [ ] Add contextual tooltips for key features
- [ ] Highlight new features with badges
- [ ] Implement tooltip dismissal
- [ ] Show tooltips only once per feature

**Acceptance Criteria:**
- [ ] First visit shows helpful tooltips
- [ ] Tooltips explain key actions
- [ ] Can dismiss tooltips
- [ ] Don't show again after dismissal

**Testing:**
```
1. Fresh install → tooltips appear on key elements
2. Hover tooltip → shows helpful text
3. Click "Got it" → tooltip dismisses
4. Refresh → tooltip doesn't reappear
5. Click "Show tips" → tooltips reappear
```

---

### Task 2.7: WhatsApp Direct Share

**Files to Modify:**
- `src/components/share/ShareButtons.tsx`
- `src/components/products/ProductCard.tsx`
- `src/components/products/CollectionCard.tsx`

**Tasks:**
- [ ] Add WhatsApp share button with wa.me link
- [ ] Pre-fill message with product/collection name + URL
- [ ] Include ref params in WhatsApp share URL
- [ ] Track WhatsApp as source in analytics

**Acceptance Criteria:**
- [ ] WhatsApp button visible on products and collections
- [ ] Clicking opens WhatsApp with pre-filled message
- [ ] Share URL includes tracking params
- [ ] WhatsApp clicks tracked separately

**Testing:**
```
1. Click WhatsApp button → WhatsApp opens with message
2. Message contains product name and URL
3. URL includes ref params
4. Check analytics → WhatsApp source recorded
5. Send to friend → link works with attribution
```

---

## Phase 3: Accessibility ⏳

**Priority:** MEDIUM  
**Target:** Phase 2 + 1 week  
**Goal:** WCAG 2.1 AA compliance

### Task 3.1: Skip Navigation Links

**Files to Modify:**
- `src/components/layout/Header.tsx`
- `src/App.tsx`
- `src/index.css`

**Tasks:**
- [ ] Add skip link as first focusable element
- [ ] Link targets main content area
- [ ] Make skip link visible on focus
- [ ] Style appropriately (visible but not ugly)

**Acceptance Criteria:**
- [ ] Skip link is first tab target
- [ ] Visible when focused
- [ ] Jumps to main content
- [ ] Works on all pages

**Testing:**
```
1. Load page → skip link not visible
2. Press Tab → skip link becomes visible
3. Press Enter on skip link → focus jumps to main
4. Verify main content is focus target
5. Test on all major pages
```

---

### Task 3.2: Breadcrumbs

**Files to Modify:**
- `src/components/layout/Breadcrumbs.tsx` (create)
- `src/pages/Dashboard.tsx`
- `src/pages/MyProducts.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Profile.tsx`

**Tasks:**
- [ ] Create Breadcrumbs component
- [ ] Add breadcrumbs to inner pages
- [ ] Make breadcrumbs keyboard accessible
- [ ] Add structured data for SEO

**Acceptance Criteria:**
- [ ] Breadcrumbs show current location
- [ ] Each crumb is clickable link
- [ ] Current page not linked
- [ ] Mobile-friendly collapsed view

**Testing:**
```
1. Navigate to Settings → breadcrumb shows Home > Settings
2. Click "Home" → navigates to dashboard
3. Current page not linked
4. Test with screen reader → announces correctly
5. Mobile view → collapsed with menu
```

---

### Task 3.3: Command Palette (Cmd+K Search)

**Files to Modify:**
- `src/components/CommandPalette.tsx` (create)
- `src/App.tsx`
- `src/hooks/useCommandPalette.ts` (create)

**Tasks:**
- [ ] Create command palette component
- [ ] Implement keyboard shortcut (Cmd+K / Ctrl+K)
- [ ] Add search products functionality
- [ ] Add navigation commands
- [ ] Add recent searches

**Acceptance Criteria:**
- [ ] Cmd+K opens palette
- [ ] Can search products
- [ ] Can navigate to pages
- [ ] Escape closes palette
- [ ] Arrow keys navigate results

**Testing:**
```
1. Press Cmd+K → palette opens
2. Type "product name" → results appear
3. Click/Enter result → navigates to product
4. Press Escape → palette closes
5. Use arrow keys → navigate results
6. Test Cmd+K on all pages
```

---

### Task 3.4: Focus Management

**Files to Modify:**
- `src/components/layout/ErrorBoundary.tsx`
- `src/components/products/AddProductForm.tsx`
- `src/components/auth/Login.tsx`
- `src/components/auth/Register.tsx`

**Tasks:**
- [ ] Set initial focus on page load
- [ ] Manage focus after modals close
- [ ] Manage focus after route changes
- [ ] Add focus indicators

**Acceptance Criteria:**
- [ ] First interactive element focused on page load
- [ ] Modal focus trapped inside modal
- [ ] Focus returns after modal closes
- [ ] Visible focus indicators on all interactive elements

**Testing:**
```
1. Load Login page → email field focused
2. Open modal → focus trapped inside
3. Close modal → focus returns to trigger
4. Navigate pages → focus moves appropriately
5. Tab through page → all elements have focus indicator
```

---

### Task 3.5: ARIA Labels & Live Regions

**Files to Modify:**
- `src/components/products/ProductControls.tsx`
- `src/components/products/ProductFilters.tsx`
- `src/components/ui/Button.tsx`
- Various icon-only buttons

**Tasks:**
- [ ] Add aria-labels to icon-only buttons
- [ ] Add aria-live regions for dynamic content
- [ ] Add aria-describedby for form fields
- [ ] Verify with screen reader

**Acceptance Criteria:**
- [ ] All icon buttons have accessible names
- [ ] Dynamic content announced by screen reader
- [ ] Form fields have associated labels
- [ ] Works with VoiceOver, NVDA, JAWS

**Testing:**
```
1. Use VoiceOver → all buttons have names
2. Add product → screen reader announces
3. Filter products → count announced
4. Error occurs → error announced
5. Run axe audit → no aria violations
```

---

## Phase 4: Polish & Performance ⏳

**Priority:** LOW  
**Target:** After Phase 3  
**Goal:** Fine-tune and optimize

### Task 4.1: Bundle Size Optimization

**Files to Modify:**
- `vite.config.ts`
- `src/App.tsx`
- Various large components

**Tasks:**
- [ ] Add vite-bundle-analyzer
- [ ] Identify large dependencies
- [ ] Implement route-based code splitting
- [ ] Lazy load heavy components

**Acceptance Criteria:**
- [ ] Bundle size < 250KB gzipped
- [ ] Route-based chunks created
- [ ] Heavy components lazy loaded
- [ ] No duplicate dependencies

**Testing:**
```
1. Run build → check bundle size
2. Open bundle analyzer → review chunks
3. Test each route → ensure lazy loading works
4. Measure LCP on production → < 2.5s
5. Lighthouse score > 90
```

---

### Task 4.2: Error Boundary Enhancement

**Files to Modify:**
- `src/components/layout/ErrorBoundary.tsx`

**Tasks:**
- [ ] Add error reporting to backend
- [ ] Add "Copy Error" button for support
- [ ] Add error ID for debugging
- [ ] Improve error messages for users

**Acceptance Criteria:**
- [ ] Errors reported to backend (future: Sentry)
- [ ] User sees friendly error message
- [ ] Support can locate error via ID
- [ ] "Try Again" recovers from error

**Testing:**
```
1. Trigger error → user sees friendly message
2. Error logged with unique ID
3. Copy button copies error details
4. "Try Again" recovers app state
5. Error boundary catches all React errors
```

---

### Task 4.3: Performance Monitoring

**Tasks:**
- [ ] Integrate Sentry for frontend
- [ ] Add performance marks
- [ ] Set up Core Web Vitals tracking
- [ ] Create performance budget

**Acceptance Criteria:**
- [ ] JS errors captured in Sentry
- [ ] Performance marks in production
- [ ] CWV reporting active
- [ ] Alerts for CWV degradation

**Testing:**
```
1. Trigger JS error → appears in Sentry
2. Check performance dashboard → marks visible
3. Simulate slow connection → CWV captured
4. Verify alert fires on CWV < threshold
```

---

### Task 4.4: End-to-End Tests

**Files to Create:**
- `e2e/login.spec.ts`
- `e2e/add-product.spec.ts`
- `e2e/create-page.spec.ts`
- `e2e/collaboration.spec.ts`

**Tasks:**
- [ ] Set up Playwright
- [ ] Write happy path E2E tests
- [ ] Add tests to CI pipeline
- [ ] Maintain > 70% coverage

**Acceptance Criteria:**
- [ ] Core flows tested automatically
- [ ] Tests run on every PR
- [ ] Tests pass consistently
- [ ] Easy to add new tests

**Testing:**
```
1. Run e2e tests locally → all pass
2. Run in CI → all pass
3. Add new test for feature → works
4. Modify feature → test catches regression
```

---

## Testing Standards

### Every Task Must Include:

1. **Unit Tests** - For utility functions and hooks
2. **Component Tests** - For UI components
3. **Integration Tests** - For user flows
4. **E2E Tests** - For critical paths

### Test Before Commit:
```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint

# Run build
npm run build
```

### Test Commands by Type:
```bash
# Unit tests
npm test -- --run

# Component tests (if using React Testing Library)
npm test -- ProductCard.test.tsx

# E2E tests
npx playwright test

# Lighthouse audit
npx lighthouse http://localhost:8080 --output=json
```

---

## Git Workflow

### Branch Naming:
```
phase1/feature-name
phase2/feature-name
fix/critical-issue
```

### Commit Messages:
```
phase1(email-verification): add email verification flow

- Add verification email template
- Implement token generation
- Add verification page
- Add tests

Closes #XXX
```

### PR Template:
```markdown
## Summary
Brief description of changes

## Phase
- [ ] Phase 1: Critical Fixes
- [ ] Phase 2: UX Improvements
- [ ] Phase 3: Accessibility
- [ ] Phase 4: Polish

## Testing
- [ ] Unit tests added/updated
- [ ] Component tested manually
- [ ] E2E tests pass
- [ ] Build succeeds

## Checklist
- [ ] No console errors
- [ ] Accessible (keyboard + screen reader)
- [ ] Mobile responsive
- [ ] Documentation updated
```

---

## Progress Tracking

Update this section as tasks are completed:

### Phase 1 Progress
- [ ] Task 1.1: Email Verification
- [ ] Task 1.2: Public Page OG Tags
- [ ] Task 1.3: Password Reset Flow
- [ ] Task 1.4: Onboarding Wizard Integration
- [ ] Task 1.5: Session Expiry Handling
- [ ] Task 1.6: Invalid URL Error Handling
- [ ] Task 1.7: Product Image Fallback
- [ ] Task 1.8: Backend API Error Handling

### Phase 2 Progress
- [ ] Task 2.1: Empty States
- [ ] Task 2.2: Loading States & Skeletons
- [ ] Task 2.3: Toast Notifications Polish
- [ ] Task 2.4: Form Validation UX
- [ ] Task 2.5: Confirmation Dialogs
- [ ] Task 2.6: Onboarding Tooltips

### Phase 3 Progress
- [ ] Task 3.1: Skip Navigation Links
- [ ] Task 3.2: Breadcrumbs
- [ ] Task 3.3: Command Palette
- [ ] Task 3.4: Focus Management
- [ ] Task 3.5: ARIA Labels & Live Regions

### Phase 4 Progress
- [ ] Task 4.1: Bundle Size Optimization
- [ ] Task 4.2: Error Boundary Enhancement
- [ ] Task 4.3: Performance Monitoring
- [ ] Task 4.4: End-to-End Tests

---

## Notes

- All phases should maintain backward compatibility
- Create feature flags for large features
- Document any breaking changes
- Update USER_FLOW_DOCUMENTATION.md as features ship
- Keep CHANGELOG_PRODUCTION_FIXES.md updated

# Changelog - Production Readiness Fixes

## v1.1.0 - Production Readiness Fixes (2026-04-02)

### Critical Security Fixes

#### CRITICAL-1: Provider Nesting Mismatch Fixed
- **File**: `src/App.tsx:104-111`
- **Issue**: Closing provider tags were misaligned, causing context corruption
- **Fix**: Corrected closing tag order to match opening order (reverse nesting)
- **Impact**: Critical - affected all context consumers

#### CRITICAL-2: JWT Fallback Secret Removed
- **File**: `server/src/config/index.ts:12-21`
- **Issue**: Hardcoded fallback JWT secret allowed token forgery
- **Fix**: Server now fails to start in production if JWT_SECRET is not set
- **Impact**: Critical security - prevented forged authentication tokens

#### CRITICAL-3: Database SSL Verification Enabled
- **File**: `server/src/config/database.ts:6-14`
- **Issue**: `rejectUnauthorized: false` allowed man-in-the-middle attacks
- **Fix**: SSL verification now enabled in production; configurable via DATABASE_SSL env var
- **Impact**: Critical security - prevented database connection interception

### High Priority Bug Fixes

#### HIGH-1: ProductFilters maxPrice Bug Fixed
- **File**: `src/components/products/ProductFilters.tsx:92-94`
- **Issue**: `Math.max(...tags.map(tag => 10000))` always returned 10000
- **Fix**: Now calculates max price from actual product prices
- **Impact**: Price filter slider always showed max as 10000 regardless of products

#### HIGH-2: ProductContext Performance Optimized
- **File**: `src/contexts/ProductContext.tsx:57-68, 91-138`
- **Issue**: `filteredProducts`, `productCategories`, `productTags` recomputed every render
- **Fix**: Added `useMemo` to memoize expensive computations
- **Impact**: Improved render performance, reduced GC pressure

#### HIGH-3: Dashboard Performance Optimized
- **File**: `src/pages/Dashboard.tsx:32-64`
- **Issue**: `categoryCounts`, `tagCounts`, `currencyData` recreated every render
- **Fix**: Added `useMemo` to memoize dashboard data computations
- **Impact**: Improved dashboard render performance

#### HIGH-4: CI Tests Enabled
- **File**: `.github/workflows/ci.yml:36-38`
- **Issue**: Tests were commented out in CI pipeline
- **Fix**: Uncommented test step to run on every PR
- **Impact**: Tests now run in CI to prevent regressions

### Medium Priority Improvements

#### MEDIUM-1: CSP unsafe-eval Removed
- **File**: `vercel.json:8`
- **Issue**: CSP allowed `unsafe-eval` which enables code injection attacks
- **Fix**: Removed `unsafe-eval` from script-src directive
- **Note**: `unsafe-inline` remains - requires nonce implementation for full CSP hardening
- **Impact**: Improved XSS protection

#### MEDIUM-2: CSPReporter Memory Leak Fixed
- **File**: `src/utils/security.ts:178-200`
- **Issue**: Event listener was never cleaned up, preventing garbage collection
- **Fix**: Added `cleanup()` method and stored handler reference for removal
- **Impact**: Improved memory management, especially for SSR/testing

#### MEDIUM-3: ErrorBoundary Reset Added
- **File**: `src/components/layout/ErrorBoundary.tsx`
- **Issue**: Users had to refresh page to recover from errors
- **Fix**: Added "Try Again" and "Reload Page" buttons for recovery
- **Impact**: Better UX when errors occur

## Known Remaining Issues

### Not Yet Fixed (Lower Priority)
1. **CSRF token validation is placeholder** - Only checks length, not validity
2. **API key encryption key in localStorage** - Should use key derivation or server-side storage
3. **Auth endpoints lack rate limiting** - Global rate limit applies but auth-specific recommended
4. **No structured logging** - Using console.log/error instead of pino/Winston
5. **No Sentry integration** - Error tracking not implemented
6. **TanStack Query underutilized** - Data still flows through Context instead of queries
7. **No API versioning** - Routes lack /api/v1/ prefix
8. **No refresh tokens** - Session relies solely on JWT

## Migration Notes

### For Developers
After pulling these changes:
1. Run `npm install` to ensure dependencies are up to date
2. Set `JWT_SECRET` environment variable in production (required)
3. Set `DATABASE_SSL=true` in production for NeonDB SSL connections
4. Run `npm test` locally before pushing to verify tests pass

### Environment Variables Required for Production
```env
# Backend (server/.env)
JWT_SECRET=<generate-strong-random-string>  # REQUIRED
DATABASE_SSL=true                           # Enable SSL verification
NODE_ENV=production
```

## Testing
- All existing tests pass
- CI now runs test suite on every PR
- Manual testing recommended for:
  - Provider context flow (login → dashboard → products)
  - Collaboration system (invite → accept → manage)
  - Theme customization persistence

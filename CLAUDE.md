# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

eComJunction is a SAAS platform for influencers and affiliate marketers to showcase and organize product recommendations. The platform features AI-powered product extraction from URLs using OpenAI's GPT-4o-mini model.

## Development Commands

### Core Commands (Frontend)
- `npm run dev` - Start frontend development server on port 8080
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Commands
- `npm run dev:server` - Start backend API server on port 3001
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run server:install` - Install backend dependencies
- `npm run server:start` - Start backend production server

### Database Commands
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate-safe` - Run missing tables only
- `npm run db:test` - Test database connection
- `npm run db:seed` - Seed demo data

### Development Server Ports
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **State Management**: React Context (ProductContext, ThemeContext)
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **Database**: NeonDB (PostgreSQL) - accessed via backend API only
- **Storage**: Cloudflare R2 (configured for file uploads)
- **Email**: Dynamic SMTP (EmailIT, Resend, SendGrid, Custom SMTP)
- **Analytics**: Google Analytics 4 (GA4)
- **Security**: Cloudflare Turnstile (spam protection)
- **AI Integration**: OpenAI GPT-4o-mini for product extraction

### Key Architecture Patterns

#### Context-Based State Management
- **AuthContext**: Handles user authentication, sessions, roles, and demo mode
- **PageContext**: Manages shareable pages, collaboration, and team members
- **ProductContext**: Manages product data, filtering, sorting, and CRUD operations
- **ThemeContext**: Handles theme customization with CSS variable updates
- Products are persisted in localStorage with key "shopmatic-products"
- Pages and collaborators persisted per user with key "pages_{userId}"
- Theme settings are persisted in localStorage with key "shopmatic-theme"
- Authentication sessions are encrypted and stored with key "shopmatic_auth"

#### AI-Powered Product Extraction
- **OpenAIService**: Handles AI-powered product data extraction from URLs
- **ProductExtractionService**: Orchestrates URL parsing and AI extraction
- **URLParsingService**: Handles URL validation and HTML content fetching
- API keys are managed through APIKeyManager utility

#### Component Structure
- **Pages**: Route-level components in src/pages/
- **Layout**: Header, Footer, ErrorBoundary in src/components/layout/
- **Products**: All product-related components in src/components/products/
- **Auth**: Authentication components in src/components/auth/
- **UI**: shadcn/ui components in src/components/ui/
- **Theme**: Theme customization components in src/components/theme/
- **Compliance**: GDPR/CCPA and legal compliance in src/components/compliance/

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

### TypeScript Configuration
- Base configuration in tsconfig.json with references to app and node configs
- Relaxed TypeScript settings: noImplicitAny, strictNullChecks, noUnusedLocals disabled
- Path aliases configured for @ import

### Styling
- Tailwind CSS with custom CSS variables for theming
- Theme colors are dynamically converted from hex to HSL and applied as CSS variables
- Custom theme system allows real-time color customization

### Database & Infrastructure

**Database**: NeonDB (PostgreSQL)
- **Access Pattern**: Backend API endpoints only (client-side DB access is blocked for security)
- **Type Safety**: Full TypeScript types in src/lib/neondb.ts
- **Security**: Client-side helpers throw errors to prevent direct database access
- **Backend API**: RESTful endpoints handle all database operations

**SMTP Configuration**:
- **Per-User Settings**: Each user configures their preferred email provider in Settings
- **Supported Providers**: EmailIT, Resend, SendGrid, Custom SMTP
- **Storage**: SMTP settings stored in database (smtp_settings table)
- **UI**: SMTPConfigManager component in Settings page

**Storage**:
- **Cloudflare R2**: File uploads and media storage (configured)
- **localStorage**: Temporary client-side data (products, pages - migration to API in progress)

**Analytics & Security**:
- **Google Analytics**: GA4 integration via `VITE_GA_MEASUREMENT_ID`
- **Cloudflare Turnstile**: Bot protection and spam prevention

## Key Features

### Product Management
- Add products manually or via AI-powered URL extraction
- Grid/List view modes with advanced filtering and sorting
- Categories, tags, price ranges, and rating filters
- Real-time search functionality
- localStorage persistence

### AI Integration
- OpenAI GPT-4o-mini for product data extraction
- HTML content analysis with 4000 character limit
- Confidence scoring for extraction quality
- Fallback handling for API failures

### Theme System
- Dynamic theme customization with real-time preview
- CSS variable-based theming system
- Persistent theme settings across sessions
- Hex to HSL color conversion utility

## Environment Variables
- `VITE_OPENAI_API_KEY` - Required for AI-powered product extraction

## Notable Implementation Details

### Error Handling
- ErrorBoundary component wraps the entire application
- Graceful fallbacks for missing API keys
- Service availability checks for OpenAI integration

### Performance Optimizations
- Vite with SWC for fast builds and HMR
- TanStack Query for efficient data fetching
- Lovable-tagger plugin for development mode component tagging

### Development Workflow
- ESLint with TypeScript support and React hooks rules
- Relaxed linting rules for development efficiency
- Vitest test framework configured with React Testing Library

## Production Readiness Features

### Security
- **API Key Encryption**: Web Crypto API with AES-GCM encryption for secure API key storage
- **Input Validation**: Comprehensive validation using Zod schemas and DOMPurify sanitization
- **XSS Protection**: Content Security Policy headers and input sanitization
- **Rate Limiting**: Client-side rate limiting for API calls
- **CSRF Protection**: Security headers and form validation

### Compliance
- **GDPR/CCPA**: Cookie consent management with granular preferences
- **Data Management**: User data export and deletion functionality
- **FTC Compliance**: Automatic affiliate disclosure detection and display
- **Privacy Controls**: Comprehensive privacy settings page

### Data Protection
- **Secure Storage**: Encrypted localStorage with Web Crypto API
- **Data Sanitization**: All user inputs sanitized before storage
- **Privacy by Design**: Local-first data storage with user control

### Testing
- **Unit Tests**: Comprehensive test coverage for security-critical components
- **Security Tests**: Validation of encryption, sanitization, and security utilities
- **Component Tests**: React component testing with user interaction simulation

### Content Security Policy
- Strict CSP headers with nonce support
- XSS protection and clickjacking prevention
- Secure resource loading restrictions

### Authentication System
- **Email-based Authentication**: Full registration and login with email validation
- **Demo Mode**: Instant access with sample data, no persistence
- **Session Management**: Encrypted sessions with integrity validation using Web Crypto API
- **Route Protection**: ProtectedRoute component for authenticated pages
- **User Roles**: Free, Pro, Enterprise plans with feature gating
- **Security Features**: 
  - Session expiration (24 hours)
  - Session integrity verification with hash validation
  - Secure password handling (mock implementation for demo)
  - Rate limiting for authentication attempts

### Demo Login Credentials
- **Email**: user@example.com or pro@example.com
- **Password**: password123
- **Admin**: admin@ecomjunction.com / admin123
- **Demo Mode**: Click "Demo Login" for instant access without account creation

### Role-Based Access Control (RBAC)
- **Platform Roles**: Define user's global permissions
  - `admin` - Platform administrator with full system access
  - `affiliate_marketer` - Content creators who create pages and products
  - `end_user` - Anonymous visitors browsing public pages
- **Page Roles**: Define permissions per page (collaboration system)
  - `owner` - Page creator with full control including deletion
  - `admin` - Full page management except deletion
  - `editor` - Manage products only (add/edit/delete)
  - `viewer` - Read-only analytics access
- **Permission System**: src/utils/permissions.ts for platform roles, src/utils/pagePermissions.ts for page roles
- **Role Guards**: RoleGuard component protects routes by role/permission

## Collaboration System

### Overview
The platform supports team collaboration at the page level. Page owners can invite team members with different roles to help manage their pages.

### Architecture
- **Two-Tier Role System**:
  - Platform Role: Who you are globally (affiliate_marketer, admin, end_user)
  - Page Role: What you can do on a specific page (owner, admin, editor, viewer)
- **Per-Page Teams**: Each page can have its own team with role-based permissions
- **Plan-Based Limits**: Team size limits based on subscription plan
- **Backend API Architecture**: NeonDB (PostgreSQL) with RESTful API endpoints
- **Email Notifications**: Dynamic SMTP configuration (EmailIT, Resend, SendGrid, Custom SMTP)

### Page Roles & Permissions

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| Edit Page Settings | ✅ | ✅ | ❌ | ❌ |
| Delete Page | ✅ | ❌ | ❌ | ❌ |
| Add Products | ✅ | ✅ | ✅ | ❌ |
| Edit Products | ✅ | ✅ | ✅ | ❌ |
| Delete Products | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ |
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ✅ | ❌ | ❌ |
| Change Roles | ✅ | ✅ | ❌ | ❌ |

### Team Limits by Plan
- **Free Plan**: 0 team members (solo only)
- **Pro Plan**: 3 team members per page
- **Enterprise Plan**: Unlimited team members per page

### Database Tables
- `pages` - Shareable page metadata and settings
- `page_products` - Junction table for page-product relationships
- `page_collaborators` - Team members and their roles per page
- `page_invitations` - Pending email invitations with secure tokens
- `team_member_limits` - Track team size and limits per page
- `activity_log` - Audit trail for collaboration activities

### Key Features
- **Email-Based Invitations**: Secure token-based invitation system
- **Role Management**: Change member roles dynamically
- **Activity Logging**: Complete audit trail of team changes
- **Auto-Initialization**: Owner automatically added when page is created
- **Plan Enforcement**: Team size limits enforced by subscription plan
- **Smart Validation**: Prevent duplicate invitations, invalid roles, etc.

### API Layer
- **CollaborationService** (src/services/CollaborationService.ts):
  - Client-side service that communicates with backend API
  - Page CRUD operations via REST endpoints
  - Collaborator management (add, update, remove)
  - Invitation lifecycle (create, accept, cancel)
  - Team limits queries
  - **NO DIRECT DATABASE ACCESS** - All operations go through backend

- **EmailServiceNew** (src/services/EmailServiceNew.ts):
  - Dynamic SMTP configuration per user
  - Supports 4 providers: EmailIT, Resend, SendGrid, Custom SMTP
  - Team invitation emails with role descriptions
  - CAN-SPAM compliant templates
  - 5-minute caching for SMTP settings

- **NeonDB Integration** (src/lib/neondb.ts):
  - Type definitions for database schema
  - Client-side helpers throw security errors (prevent direct DB access)
  - Actual database operations performed by backend API

- **Backend API Endpoints** (to be implemented):
  ```
  POST   /api/pages
  GET    /api/pages?userId=:userId
  GET    /api/pages/:pageId
  PATCH  /api/pages/:pageId
  DELETE /api/pages/:pageId
  GET    /api/pages/:pageId/collaborators
  POST   /api/pages/:pageId/collaborators
  PATCH  /api/collaborators/:collaboratorId/role
  DELETE /api/collaborators/:collaboratorId
  POST   /api/pages/:pageId/invitations
  GET    /api/pages/:pageId/invitations
  GET    /api/invitations/:token
  POST   /api/invitations/:token/accept
  DELETE /api/invitations/:invitationId
  GET    /api/pages/:pageId/team-limits
  GET    /api/smtp-settings/:userId/active
  ```

### Context Management
- **PageContext**: Manages pages and collaboration (src/contexts/PageContext.tsx)
  - `getCollaborators(pageId)` - Get all team members for a page
  - `inviteMember(pageId, {email, role})` - Send invitation
  - `removeMember(pageId, collaboratorId)` - Remove team member
  - `updateMemberRole(pageId, collaboratorId, newRole)` - Change role
  - `acceptInvitation(token)` - Accept invitation via token
  - `getUserRole(pageId)` - Get current user's role on a page
  - `canInviteMembers(pageId)` - Check invitation permission

### Invitation Flow
1. Owner/Admin invites member via email
2. System generates secure token (32 chars, 7-day expiration)
3. Invitation stored in `page_invitations` table
4. Email sent with invitation link (future: email service)
5. Recipient logs in and accepts invitation via token
6. User added to `page_collaborators` with specified role
7. Team member count updated automatically

### Security Features
- Secure random token generation (Web Crypto API)
- Invitation expiration (7 days default)
- Email validation (must match invitation email)
- Permission checks for all operations
- Cannot invite as owner (owner is creator only)
- Cannot change owner role
- Activity logging for audit trails
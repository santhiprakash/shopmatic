# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Shopmatic (Shopmatic)

**Description:**
Shopmatic is a SaaS platform for influencers and affiliate marketers to create, organize, and share personalized product showcase pages. Users can add affiliate products, organize them with categories and tags, and share their showcase with their audience. The platform supports different user roles and subscription plans, and aims for high accessibility, security, and scalability.

---

## 2. Goals & Objectives

- Enable users to easily add and manage affiliate products.
- Allow users to customize their showcase pages (theme, layout, etc.).
- Support robust analytics for product performance.
- Ensure accessibility (a11y) and compliance (GDPR, CCPA, FTC).
- Provide a scalable, maintainable, and production-ready codebase.

---

## 3. User Roles & Permissions

| Role         | Capabilities                                                                                 |
|--------------|---------------------------------------------------------------------------------------------|
| Free User    | Showcase up to 50 products, basic customization, standard analytics, community support      |
| Pro User     | Unlimited products, advanced customization, detailed analytics, priority support, custom domain |
| Enterprise   | Multiple team members, white-label, API access, advanced integrations, dedicated support    |
| Admin        | Platform management, user/content moderation, system analytics                              |

---

## 4. Core Features

### 4.1. User Management
- Registration (email/social login)
- Email verification
- Profile setup (username, bio, avatar, social links)
- **Social media handles connection (Instagram, Twitter, YouTube, TikTok, LinkedIn)**
- Role-based access and feature gating
- **Real-time profile updates and synchronization**

### 4.2. Product Management
- Add product (manual or via affiliate URL parsing)
- **Bulk product import from multiple URLs**
- **Automatic affiliate ID injection for supported platforms**
- Edit, delete, and organize products
- Bulk operations (edit, delete, categorize)
- Tag and category management
- Set commission rates (optional)
- Product status (active/inactive)
- **Affiliate ID management for Amazon, Flipkart, Myntra, Nykaa**
- **Quick product addition with AI-powered extraction**

### 4.3. Showcase Management
- Personalized showcase page per user
- Customizable layout and theme
- Filtering and search by category/tag
- Public sharing of showcase URL

### 4.4. Analytics
- Track product views, clicks, conversions
- Analytics dashboard for users
- System analytics for admins

### 4.5. Customization
- **Enhanced theme customizer with improved visibility**
- **Real-time color preview with better white color handling**
- **Tooltip-enabled theme selector with gradient backgrounds**
- Advanced customization for Pro/Enterprise

### 4.6. Notifications
- Toast notifications for user actions
- Error boundaries for graceful error handling

### 4.7. Accessibility & Compliance
- All forms and dialogs are accessible (labels, ARIA, keyboard navigation)
- GDPR/CCPA compliance (data export/delete, cookie consent)
- FTC affiliate disclosure on all showcase pages

### 4.8. Social Media Integration
- **Complete social media handles management system**
- **Support for Instagram, Twitter/X, YouTube, TikTok, LinkedIn**
- **Interactive social media manager with validation**
- **Multiple display variants (icons-only, compact, full)**
- Display social media handles on showcase pages
- Social media verification badges
- Cross-platform sharing capabilities
- **Real-time social media link validation**
- Social media analytics integration (future)

### 4.9. Affiliate Management System
- **Multi-platform affiliate ID management**
- **Automatic affiliate URL injection for Amazon, Flipkart, Myntra, Nykaa**
- **Bulk product import with affiliate ID application**
- **Platform-specific URL formatting and validation**
- **Affiliate ID tracking and association with products**
- **Support for up to 20 URLs per bulk import batch**
- **Real-time progress tracking for bulk operations**
- **Error handling and retry mechanisms for failed imports**

---

## 5. Technical Requirements

### 5.1. Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui and Radix for accessible UI primitives
- React Router for navigation
- React Query for data fetching
- React Hook Form for form management

### 5.2. Backend
- **Supabase for backend-as-a-service**
- **PostgreSQL database with Row Level Security (RLS)**
- **Real-time authentication and user management**
- **Automatic database triggers and functions**
- **Email authentication with verification**
- **Social media links and affiliate ID storage**
- Cloudinary for image management (planned)

### 5.3. Infrastructure (Planned)
- AWS/Vercel for hosting
- Cloudflare for CDN
- EmailIT for emails
- Razorpay for payments

---

## 6. Security & Compliance

- End-to-end encryption for sensitive data
- Regular security audits
- Automated and manual content moderation
- Prohibited product categories enforcement
- Community reporting system

---

## 7. Monetization

- Free, Pro, and Enterprise subscription plans
- Razorpay integration for payments (planned)
- Feature gating based on subscription

---

## 8. Accessibility (a11y) Standards

- All forms have associated labels and ARIA attributes
- All dialogs and modals are keyboard accessible and focus-trapped
- All interactive elements are tabbable and have visible focus
- Inline error feedback and ARIA live regions for screen readers
- Ongoing a11y audits and improvements

---

## 9. Open Issues & Next Steps

- **✅ Completed: Supabase integration with authentication and database**
- **✅ Completed: Social media handles management system**
- **✅ Completed: Enhanced theme customizer with improved UX**
- **✅ Completed: Affiliate ID management and bulk import system**
- Complete migration from localStorage to Supabase for product data
- Implement real-time analytics dashboard
- Add email verification and password reset flows
- Expand test coverage (unit, integration, e2e)
- Continue accessibility improvements for all forms and interactive components
- Add support for more affiliate platforms
- Implement social media verification system
- Add advanced bulk import features (CSV, Excel support)

---

## 10. Documentation & Change Log

- All production-readiness and a11y improvements are tracked in `docs/production-readiness.md`
- Ongoing updates to README and developer documentation

---

**This PRD should be updated as the project evolves.** 

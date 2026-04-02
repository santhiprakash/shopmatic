
# Shopmatic - Affiliate Product Showcase Platform
## Comprehensive Planning Document

### Project Overview
eComJunction is a SAAS platform designed for influencers and affiliate marketers to showcase and organize their product recommendations. The platform enables users to create personalized showcase pages with their affiliate products, organize them with categories and tags, and share them with their audience.

### Current Status
**Database Setup**: ✅ Completed - Supabase database configured with complete schema
**UI Enhancement**: ✅ In Progress - Theme customization and visual improvements implemented
**Authentication**: 📋 Planned - Email auth and social login integration
**Product Management**: 📋 Planned - Advanced product addition and management features

### Brand Information
- **Brand Name:** Shopmatic
- **Website:** shopmatic.cc
- **Email:** info@shopmatic.cc
- **Address:** Shivakrupa Nilayam, TC Palya, Bengaluru, KA, India - 560036

## User Roles & Permissions

### 1. Free User
- Can showcase up to 50 products
- Basic customization options
- Standard analytics
- Community support

### 2. Pro User
- Unlimited products
- Advanced customization
- Detailed analytics
- Priority support
- Custom domain support

### 3. Enterprise User
- Multiple team members
- White-label options
- API access
- Dedicated support
- Advanced integrations

### 4. Admin
- Platform management
- User management
- Content moderation
- System analytics

## User Flow

### Registration & Onboarding
1. User visits landing page
2. Signs up with email/social login
3. Email verification
4. Profile setup (username, bio, social links)
5. Theme customization
6. First product addition tutorial
7. Dashboard introduction

### Product Management Flow
1. **Add Product**
   - Paste affiliate URL
   - Auto-parse product details
   - Manual editing if needed
   - Add custom tags/categories
   - Set commission rate (optional)
   - Publish product

2. **Organize Products**
   - Create custom categories
   - Add tags for filtering
   - Set product status (active/inactive)
   - Bulk operations (edit, delete, categorize)

3. **Showcase Management**
   - Customize layout
   - Choose display options
   - Set filtering preferences
   - Share showcase URL

### Visitor Flow
1. Visit user's showcase page
2. Browse products by categories/tags
3. Use search and filters
4. Click on product of interest
5. Redirect to affiliate link
6. Purchase tracked (if applicable)

## Database Architecture

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    website_url VARCHAR(500),
    social_links JSONB,
    theme_settings JSONB,
    subscription_plan VARCHAR(20) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    image_url VARCHAR(500),
    affiliate_url VARCHAR(1000) NOT NULL,
    original_url VARCHAR(1000),
    source VARCHAR(50), -- Amazon, Flipkart, etc.
    rating DECIMAL(2, 1),
    review_count INTEGER,
    commission_rate DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'active',
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tags Table
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7), -- hex color
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Product_Categories Table
```sql
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);
```

### Product_Tags Table
```sql
CREATE TABLE product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);
```

### Analytics Table
```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'conversion'
    visitor_ip VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Technical Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui component library
- React Router for navigation
- React Query for data fetching
- React Hook Form for form management

### Backend (Current)
- **Supabase**: Complete backend-as-a-service solution
  - PostgreSQL database with Row Level Security
  - Built-in authentication with email and social providers
  - Real-time subscriptions
  - Edge functions for serverless computing
  - Storage for file uploads

### Database Schema (Implemented)
- **users**: User profiles with theme settings and social links
- **affiliate_ids**: Platform-specific affiliate ID management (Amazon, Flipkart, etc.)
- **products**: Product catalog with affiliate tracking and commission data
- **categories**: User-defined product categories with color coding
- **analytics**: Click tracking, conversions, and performance metrics
- **RLS Policies**: Secure data access with user-specific permissions
- **Triggers**: Automatic timestamp updates and user creation handling

### Infrastructure (Future)
- AWS/Vercel for hosting
- CloudFlare for CDN
- SendGrid for emails
- Stripe for payments

## Security & Compliance

### Data Protection
- GDPR compliance for EU users
- CCPA compliance for California users
- End-to-end encryption for sensitive data
- Regular security audits

### Content Moderation
- Automated content filtering
- Manual review process
- Prohibited product categories
- Community reporting system

### Affiliate Compliance
- Automatic FTC disclosure generation
- Platform-specific compliance (Amazon Associates)
- Terms enforcement
- Link validation

## Monetization Strategy

### Subscription Plans
1. **Free Plan** - $0/month
   - Up to 50 products
   - Basic customization
   - Community support

2. **Pro Plan** - $19/month
   - Unlimited products
   - Advanced customization
   - Priority support
   - Analytics dashboard

3. **Enterprise Plan** - $99/month
   - Multiple team members
   - White-label options
   - API access
   - Custom integrations

### Additional Revenue Streams
- Commission sharing with high-volume users
- Premium themes and templates
- Marketplace for affiliate products
- Educational content and courses

## Marketing Strategy

### Target Audience
- Social media influencers
- Bloggers and content creators
- Affiliate marketers
- E-commerce entrepreneurs
- YouTubers and podcasters

### Acquisition Channels
- Content marketing (SEO blog)
- Social media marketing
- Influencer partnerships
- Affiliate program
- Product Hunt launch
- Google Ads

## Success Metrics

### User Engagement
- Monthly active users
- Products added per user
- Showcase page views
- Click-through rates

### Business Metrics
- Monthly recurring revenue
- Customer acquisition cost
- Lifetime value
- Churn rate
- Conversion rate

### Product Metrics
- Feature adoption rates
- Support ticket volume
- Page load times
- Uptime percentage

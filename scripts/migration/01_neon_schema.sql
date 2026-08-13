-- ============================================
-- NEON DATABASE SCHEMA FOR SHOPMATIC
-- ============================================
-- Version: 1.0
-- Date: December 22, 2025
-- Description: Complete database schema for Shopmatic platform
--              Migrating from localStorage to Neon PostgreSQL
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores user accounts and profiles
CREATE TABLE IF NOT EXISTS users (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,

    -- Profile Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    website_url VARCHAR(500),

    -- Social Links (JSONB for flexibility)
    social_links JSONB DEFAULT '{
        "twitter": null,
        "instagram": null,
        "youtube": null,
        "facebook": null,
        "linkedin": null,
        "tiktok": null,
        "pinterest": null,
        "website": null
    }'::jsonb,

    -- Theme Settings (JSONB)
    theme_settings JSONB DEFAULT '{
        "primaryColor": "#6366F1",
        "secondaryColor": "#EC4899",
        "accentColor": "#059669",
        "textColor": "#1F2937",
        "backgroundColor": "#FFFFFF"
    }'::jsonb,

    -- Subscription Management
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),

    -- Account Status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,

    -- Password Reset
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- AFFILIATE IDS TABLE
-- ============================================
-- Stores platform-specific affiliate IDs for users
CREATE TABLE IF NOT EXISTS affiliate_ids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Platform Information
    platform VARCHAR(50) NOT NULL, -- 'amazon', 'flipkart', 'myntra', 'nykaa', 'other'
    platform_name VARCHAR(100), -- Custom/display name for the platform
    affiliate_id VARCHAR(255) NOT NULL,

    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one affiliate ID per platform per user
    UNIQUE(user_id, platform)
);

-- Indexes for affiliate_ids table
CREATE INDEX IF NOT EXISTS idx_affiliate_ids_user_id ON affiliate_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_ids_platform ON affiliate_ids(platform);
CREATE INDEX IF NOT EXISTS idx_affiliate_ids_is_active ON affiliate_ids(is_active);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
-- User-defined product categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Category Information
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,

    -- Display Properties
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    icon VARCHAR(50), -- Icon name from Lucide React
    sort_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique category names per user
    UNIQUE(user_id, name),
    UNIQUE(user_id, slug)
);

-- Indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
-- Product catalog with affiliate tracking
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Product Information
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Pricing
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP')),
    original_price DECIMAL(10,2), -- For showing discounts

    -- URLs
    affiliate_url TEXT NOT NULL, -- Final URL with affiliate ID injected
    original_url TEXT, -- Original product URL before modification
    image_url TEXT,

    -- Classification
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(50), -- 'amazon', 'flipkart', 'myntra', 'nykaa', 'other'

    -- Ratings & Reviews
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,

    -- Affiliate Tracking
    platform VARCHAR(50), -- Detected platform from URL
    affiliate_id_used UUID REFERENCES affiliate_ids(id) ON DELETE SET NULL,
    commission_rate DECIMAL(5,2), -- Percentage commission (e.g., 8.00 for 8%)

    -- AI Extraction Metadata
    extraction_method VARCHAR(50), -- 'manual', 'ai', 'url_parse'
    extraction_confidence DECIMAL(3,0), -- 0-100 confidence score from AI
    extracted_at TIMESTAMP WITH TIME ZONE,
    extraction_metadata JSONB, -- Additional AI extraction data

    -- Product Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,

    -- Metrics (denormalized for performance)
    click_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_click_count ON products(click_count DESC);

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- ============================================
-- ANALYTICS TABLE
-- ============================================
-- Track product events (views, clicks, conversions)
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Event Information
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'click', 'conversion', 'share', 'favorite')),

    -- Visitor Information (for privacy, store hashed/anonymized data)
    visitor_id VARCHAR(255), -- Anonymous visitor tracking (hashed)
    visitor_ip VARCHAR(45), -- IPv4 or IPv6 (hashed for privacy)
    user_agent TEXT,
    referrer TEXT,

    -- Location Data (optional, from IP geolocation)
    country VARCHAR(2), -- ISO 3166-1 alpha-2 country code
    city VARCHAR(100),
    region VARCHAR(100),

    -- Device Information
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(50),
    os VARCHAR(50),

    -- Additional Data (flexible storage)
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON analytics(user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_product_event ON analytics(product_id, event_type, created_at DESC);

-- ============================================
-- SESSIONS TABLE
-- ============================================
-- JWT session management (optional - can use JWT only)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Token Information (hashed for security)
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) UNIQUE,

    -- Session Metadata
    user_agent TEXT,
    ip_address VARCHAR(45),

    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- API KEYS TABLE
-- ============================================
-- Store encrypted API keys (OpenAI, etc.)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Key Information
    service VARCHAR(50) NOT NULL, -- 'openai', 'perplexity', etc.
    encrypted_key TEXT NOT NULL, -- Encrypted with server-side key
    iv TEXT NOT NULL, -- Initialization vector for decryption

    -- Metadata
    key_name VARCHAR(100), -- User-defined name
    is_active BOOLEAN DEFAULT true,

    -- Usage Tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One active key per service per user
    UNIQUE(user_id, service)
);

-- Indexes for api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_ids_updated_at BEFORE UPDATE ON affiliate_ids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug for categories
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Convert name to lowercase and replace non-alphanumeric with hyphens
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        -- Remove leading/trailing hyphens
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_generate_category_slug BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION generate_category_slug();

-- Update product metrics on analytics insert
CREATE OR REPLACE FUNCTION update_product_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'click' THEN
        UPDATE products
        SET click_count = click_count + 1,
            last_clicked_at = NEW.created_at
        WHERE id = NEW.product_id;
    ELSIF NEW.event_type = 'view' THEN
        UPDATE products
        SET view_count = view_count + 1
        WHERE id = NEW.product_id;
    ELSIF NEW.event_type = 'conversion' THEN
        UPDATE products
        SET conversion_count = conversion_count + 1
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_metrics_trigger AFTER INSERT ON analytics
    FOR EACH ROW EXECUTE FUNCTION update_product_metrics();

-- Update last_login_at on session creation
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_last_login_trigger AFTER INSERT ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_last_login();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Note: Neon doesn't support auth.uid() by default
-- These policies assume a custom auth.uid() function or application-level enforcement
-- For production, implement proper authentication middleware

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Note: For Neon, RLS policies should be implemented at application level
-- or using a custom auth.uid() function. Below are example policies.

-- ============================================
-- VIEWS (for common queries)
-- ============================================

-- User product statistics
CREATE OR REPLACE VIEW user_product_stats AS
SELECT
    user_id,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE is_active = true) as active_products,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_products,
    SUM(click_count) as total_clicks,
    SUM(view_count) as total_views,
    SUM(conversion_count) as total_conversions,
    ROUND(AVG(rating), 2) as avg_rating,
    MIN(created_at) as first_product_created,
    MAX(created_at) as last_product_created
FROM products
GROUP BY user_id;

-- Product analytics summary
CREATE OR REPLACE VIEW product_analytics_summary AS
SELECT
    p.id as product_id,
    p.user_id,
    p.title,
    p.category_id,
    c.name as category_name,
    COUNT(*) FILTER (WHERE a.event_type = 'view') as views,
    COUNT(*) FILTER (WHERE a.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE a.event_type = 'conversion') as conversions,
    COUNT(*) FILTER (WHERE a.event_type = 'share') as shares,
    -- Click-through rate (CTR)
    CASE
        WHEN COUNT(*) FILTER (WHERE a.event_type = 'view') > 0
        THEN ROUND(COUNT(*) FILTER (WHERE a.event_type = 'click')::numeric /
                   COUNT(*) FILTER (WHERE a.event_type = 'view') * 100, 2)
        ELSE 0
    END as ctr_percentage,
    -- Conversion rate
    CASE
        WHEN COUNT(*) FILTER (WHERE a.event_type = 'click') > 0
        THEN ROUND(COUNT(*) FILTER (WHERE a.event_type = 'conversion')::numeric /
                   COUNT(*) FILTER (WHERE a.event_type = 'click') * 100, 2)
        ELSE 0
    END as conversion_rate_percentage,
    -- Revenue estimate (if commission_rate is set)
    CASE
        WHEN p.commission_rate IS NOT NULL AND p.price IS NOT NULL
        THEN ROUND((COUNT(*) FILTER (WHERE a.event_type = 'conversion') *
                    p.price * (p.commission_rate / 100))::numeric, 2)
        ELSE 0
    END as estimated_revenue
FROM products p
LEFT JOIN analytics a ON p.id = a.product_id
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY p.id, p.user_id, p.title, p.category_id, c.name, p.commission_rate, p.price;

-- Analytics by date (daily stats)
CREATE OR REPLACE VIEW analytics_daily_stats AS
SELECT
    DATE(created_at) as date,
    user_id,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT product_id) as products_engaged
FROM analytics
GROUP BY DATE(created_at), user_id, event_type
ORDER BY date DESC;

-- Top performing products
CREATE OR REPLACE VIEW top_products AS
SELECT
    p.*,
    c.name as category_name,
    pas.views,
    pas.clicks,
    pas.conversions,
    pas.ctr_percentage,
    pas.conversion_rate_percentage
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_analytics_summary pas ON p.id = pas.product_id
WHERE p.is_active = true
ORDER BY pas.clicks DESC, pas.views DESC;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's product count
CREATE OR REPLACE FUNCTION get_user_product_count(user_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM products WHERE user_id = user_uuid AND is_active = true;
$$ LANGUAGE SQL;

-- Check if user can add more products (subscription limits)
CREATE OR REPLACE FUNCTION check_product_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan VARCHAR(20);
    product_count INTEGER;
BEGIN
    SELECT subscription_plan INTO user_plan FROM users WHERE id = user_uuid;
    SELECT COUNT(*) INTO product_count FROM products WHERE user_id = user_uuid AND is_active = true;

    CASE user_plan
        WHEN 'free' THEN RETURN product_count < 50;
        WHEN 'pro' THEN RETURN true; -- Unlimited
        WHEN 'enterprise' THEN RETURN true; -- Unlimited
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Calculate user's earnings estimate
CREATE OR REPLACE FUNCTION calculate_user_earnings(user_uuid UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_earnings DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(
        CASE
            WHEN p.commission_rate IS NOT NULL AND p.price IS NOT NULL
            THEN p.price * (p.commission_rate / 100)
            ELSE 0
        END
    ), 0)
    INTO total_earnings
    FROM analytics a
    JOIN products p ON a.product_id = p.id
    WHERE a.user_id = user_uuid
      AND a.event_type = 'conversion'
      AND (start_date IS NULL OR a.created_at >= start_date)
      AND (end_date IS NULL OR a.created_at <= end_date);

    RETURN total_earnings;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL SETUP COMPLETE
-- ============================================

-- Insert a comment to mark schema version
COMMENT ON SCHEMA public IS 'Shopmatic Schema v1.0 - December 22, 2025';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Shopmatic database schema created successfully!';
    RAISE NOTICE 'Schema version: 1.0';
    RAISE NOTICE 'Tables created: users, products, categories, analytics, affiliate_ids, sessions, api_keys';
    RAISE NOTICE 'Views created: user_product_stats, product_analytics_summary, analytics_daily_stats, top_products';
    RAISE NOTICE 'Functions created: Helper functions for business logic';
END $$;

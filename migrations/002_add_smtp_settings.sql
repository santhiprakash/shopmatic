-- Add SMTP settings table for user email configurations
-- This allows paid users (pro/enterprise) to configure their own SMTP settings

CREATE TABLE IF NOT EXISTS user_smtp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('custom', 'resend', 'sendgrid')),
    
    -- Provider-specific settings (stored as JSONB for flexibility)
    -- Custom SMTP: {host, port, secure, username, password}
    -- Resend: {api_key}
    -- SendGrid: {api_key}
    settings JSONB NOT NULL DEFAULT '{}',
    
    -- Common fields
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    is_active BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_smtp_settings_user_id ON user_smtp_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_smtp_settings_provider ON user_smtp_settings(provider);
CREATE INDEX IF NOT EXISTS idx_user_smtp_settings_is_active ON user_smtp_settings(is_active);





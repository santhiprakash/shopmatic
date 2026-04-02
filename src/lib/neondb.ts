/**
 * NeonDB (PostgreSQL) Database Client
 * 
 * NOTE: This file contains database helper functions that should be called
 * from backend API endpoints, NOT directly from client-side code.
 * 
 * Database operations require a server-side API layer for security reasons.
 * The client should make HTTP requests to API endpoints that use these helpers.
 * 
 * This file is kept for type definitions and as a reference for backend implementation.
 */

// Database types (matching schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website_url: string | null;
          social_links: Record<string, any> | null;
          theme_settings: Record<string, any> | null;
          subscription_plan: 'free' | 'pro' | 'enterprise';
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website_url?: string | null;
          social_links?: Record<string, any> | null;
          theme_settings?: Record<string, any> | null;
          subscription_plan?: 'free' | 'pro' | 'enterprise';
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website_url?: string | null;
          social_links?: Record<string, any> | null;
          theme_settings?: Record<string, any> | null;
          subscription_plan?: 'free' | 'pro' | 'enterprise';
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          price: number | null;
          currency: string;
          affiliate_url: string;
          image_url: string | null;
          category: string | null;
          tags: string[] | null;
          commission_rate: number | null;
          rating: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          affiliate_url: string;
          image_url?: string | null;
          category?: string | null;
          tags?: string[] | null;
          commission_rate?: number | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          affiliate_url?: string;
          image_url?: string | null;
          category?: string | null;
          tags?: string[] | null;
          commission_rate?: number | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      affiliate_ids: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          affiliate_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          affiliate_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          affiliate_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          event_type: 'view' | 'click' | 'conversion';
          visitor_ip: string | null;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          event_type: 'view' | 'click' | 'conversion';
          visitor_ip?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          event_type?: 'view' | 'click' | 'conversion';
          visitor_ip?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string;
          description: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_image_url: string | null;
          theme_settings: Record<string, any> | null;
          social_links: Record<string, any> | null;
          is_active: boolean;
          is_public: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          title: string;
          description?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          theme_settings?: Record<string, any> | null;
          social_links?: Record<string, any> | null;
          is_active?: boolean;
          is_public?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          theme_settings?: Record<string, any> | null;
          social_links?: Record<string, any> | null;
          is_active?: boolean;
          is_public?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_collaborators: {
        Row: {
          id: string;
          page_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'editor' | 'viewer';
          invited_by: string | null;
          invited_at: string;
          accepted_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'editor' | 'viewer';
          invited_by?: string | null;
          invited_at?: string;
          accepted_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'editor' | 'viewer';
          invited_by?: string | null;
          invited_at?: string;
          accepted_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_invitations: {
        Row: {
          id: string;
          page_id: string;
          email: string;
          role: 'admin' | 'editor' | 'viewer';
          invited_by: string;
          token: string;
          expires_at: string;
          accepted: boolean;
          accepted_by: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          email: string;
          role: 'admin' | 'editor' | 'viewer';
          invited_by: string;
          token: string;
          expires_at: string;
          accepted?: boolean;
          accepted_by?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          email?: string;
          role?: 'admin' | 'editor' | 'viewer';
          invited_by?: string;
          token?: string;
          expires_at?: string;
          accepted?: boolean;
          accepted_by?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      team_member_limits: {
        Row: {
          page_id: string;
          max_members: number;
          current_members: number;
          last_updated: string;
        };
        Insert: {
          page_id: string;
          max_members?: number;
          current_members?: number;
          last_updated?: string;
        };
        Update: {
          page_id?: string;
          max_members?: number;
          current_members?: number;
          last_updated?: string;
        };
      };
    };
  };
}

// Error message for client-side database access attempts
const CLIENT_SIDE_ERROR = 'Database operations cannot be performed from client-side code. Please use API endpoints instead.';

// Stub pool export (not actually used, but kept for type compatibility)
export const pool = null;

// Helper functions - These throw errors when called from client-side code
// These should only be used from backend API endpoints
export const dbHelpers = {
  // User operations
  async createUserProfile(_userId: string, _userData: Partial<Database['public']['Tables']['users']['Insert']>) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async updateUserProfile(_userId: string, _userData: Database['public']['Tables']['users']['Update']) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getUserProfile(_userId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getUserByEmail(_email: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  // Product operations
  async createProduct(_productData: Database['public']['Tables']['products']['Insert']) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getUserProducts(_userId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async updateProduct(_productId: string, _productData: Database['public']['Tables']['products']['Update']) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async deleteProduct(_productId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  // Analytics operations
  async trackEvent(_eventData: Database['public']['Tables']['analytics']['Insert']) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getProductAnalytics(_productId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  // Affiliate ID operations
  async createAffiliateId(_affiliateData: Database['public']['Tables']['affiliate_ids']['Insert']) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getUserAffiliateIds(_userId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async updateAffiliateId(_affiliateIdId: string, _affiliateData: Database['public']['Tables']['affiliate_ids']['Update']) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getAffiliateIdByPlatform(_userId: string, _platform: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async deleteAffiliateId(_affiliateIdId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  // SMTP Settings operations
  async getUserSMTPSettings(_userId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async getActiveSMTPSetting(_userId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async createOrUpdateSMTPSetting(
    _userId: string,
    _provider: string,
    _settings: Record<string, any>,
    _fromEmail: string,
    _fromName?: string
  ) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async activateSMTPSetting(_userId: string, _settingId: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },

  async deleteSMTPSetting(_userId: string, _provider: string) {
    throw new Error(CLIENT_SIDE_ERROR);
  },
};

export default pool;

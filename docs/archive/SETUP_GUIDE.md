# eComJunction Setup Guide

This guide will help you set up the eComJunction project with all the new features including Supabase integration, social media management, and affiliate ID management.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier available)
- OpenAI API key (optional, for AI-powered product extraction)

## 1. Clone and Install

```bash
git clone https://github.com/santhiprakash/ecomjunction.git
cd ecomjunction
npm install
```

## 2. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your credentials:
```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI API Key (Optional - for AI product extraction)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Application Settings
VITE_APP_NAME=eComJunction
VITE_APP_URL=http://localhost:5173
```

## 3. Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Choose a strong database password and save it securely
4. Wait for the project to be ready (usually takes 2-3 minutes)

### Get Project Credentials

1. Go to Project Settings > API
2. Copy your Project URL and Anon public key
3. Update your `.env.local` file with these values

### Database Migration

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Push the database schema:
```bash
supabase db push
```

### Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following:
   - Site URL: `http://localhost:5173` (for development)
   - Redirect URLs: Add `http://localhost:5173/**`
   - Enable email confirmations (recommended for production)

## 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 5. Features Overview

### 🎨 Enhanced Theme Customizer
- Improved visibility for white colors
- Real-time color preview
- Tooltip-enabled theme selector
- Gradient background support

### 📱 Social Media Integration
- Support for Instagram, Twitter/X, YouTube, TikTok, LinkedIn
- Multiple display variants (icons-only, compact, full)
- Real-time validation
- Showcase page integration

### 💰 Affiliate Management System
- Multi-platform affiliate ID management
- Automatic URL injection for Amazon, Flipkart, Myntra, Nykaa
- Bulk product import (up to 20 URLs per batch)
- Real-time progress tracking

### 🚀 Bulk Product Import
- Import multiple products from URLs
- AI-powered product data extraction
- Automatic affiliate ID application
- Progress tracking and error handling

## 6. Using the Features

### Setting Up Affiliate IDs

1. Navigate to any product management page
2. Click "Manage Affiliate IDs"
3. Add your affiliate IDs for supported platforms:
   - Amazon Associates: Your affiliate tag (e.g., `yourname-20`)
   - Flipkart: Your Flipkart affiliate ID
   - Myntra: Your Myntra affiliate ID
   - Nykaa: Your Nykaa affiliate ID

### Managing Social Media Handles

1. Go to Dashboard or Index page
2. Click "Manage Social Media"
3. Add your social media handles
4. They will automatically appear on your showcase page

### Bulk Product Import

1. Go to "My Products" page
2. Click "Bulk Import"
3. Paste product URLs (one per line)
4. Click "Process URLs"
5. Review extracted data and add selected products

### Theme Customization

1. Click the theme customizer button (palette icon)
2. Adjust colors using the color pickers
3. Preview changes in real-time
4. Save your custom theme

## 7. Database Schema

The application uses the following main tables:

- `users` - User profiles and settings
- `products` - Product listings with affiliate links
- `affiliate_ids` - User affiliate IDs for different platforms
- `categories` - Product categories
- `analytics` - Product performance tracking

## 8. Security Features

- Row Level Security (RLS) policies
- User data isolation
- Secure authentication with Supabase
- Input validation and sanitization
- CORS protection

## 9. Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify your environment variables
   - Check if your Supabase project is active
   - Ensure RLS policies are correctly applied

2. **Affiliate ID not applying**
   - Check if you have added affiliate IDs for the platform
   - Verify the URL format is supported
   - Check browser console for errors

3. **Social media links not displaying**
   - Ensure you have added social media handles
   - Check if the user is authenticated
   - Verify the component is properly imported

4. **Bulk import failing**
   - Check if URLs are valid and accessible
   - Verify OpenAI API key if using AI extraction
   - Check network connectivity

### Getting Help

- Check the browser console for error messages
- Review the Supabase dashboard for database issues
- Ensure all environment variables are correctly set
- Check the GitHub repository for known issues

## 10. Production Deployment

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_URL=https://your-domain.com
```

### Supabase Production Settings

1. Update Site URL to your production domain
2. Add production redirect URLs
3. Enable email confirmations
4. Configure email templates
5. Set up custom SMTP (optional)

### Build and Deploy

```bash
npm run build
npm run preview  # Test production build locally
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

## 11. Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 12. License

This project is licensed under the MIT License. See the LICENSE file for details.

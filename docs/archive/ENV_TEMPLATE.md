# Environment Variables Template

Copy this template to create your `.env` file. Replace all placeholder values with your actual credentials.

```env
# ============================================
# DATABASE (NeonDB) - REQUIRED
# ============================================
# Get this from your Neon dashboard after creating a project
DATABASE_URL=postgresql://user:password@hostname.neon.tech/database?sslmode=require
VITE_NEON_DATABASE_URL=postgresql://user:password@hostname.neon.tech/database?sslmode=require

# ============================================
# CLOUDFLARE R2 (Storage) - REQUIRED
# ============================================
# Get these from Cloudflare Dashboard → R2 → Manage R2 API Tokens
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name_here
# Use your R2 public endpoint or custom domain
R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com/your-bucket-name
# OR if you have a custom domain:
# R2_PUBLIC_URL=https://cdn.yourdomain.com

# ============================================
# EMAIL SERVICE (Emailit) - REQUIRED
# ============================================
# Get API key from Emailit dashboard
EMAILIT_API_KEY=your_emailit_api_key_here
# Your verified sender email address
EMAILIT_FROM_EMAIL=notifications@yourdomain.com
# Display name for emails
EMAILIT_FROM_NAME=Your App Name
# Your production URL for email links
VITE_PRODUCTION_URL=https://yourdomain.com

# ============================================
# APPLICATION SETTINGS - REQUIRED
# ============================================
VITE_APP_NAME=Your App Name
VITE_APP_URL=https://yourdomain.com
VITE_DOMAIN=yourdomain.com
VITE_ENV=production

# ============================================
# SECURITY - REQUIRED
# ============================================
# Generate with: openssl rand -base64 32
# IMPORTANT: Use a strong, random secret in production!
VITE_JWT_SECRET=your-secure-jwt-secret-here-minimum-32-characters

# ============================================
# GOOGLE ANALYTICS (Optional)
# ============================================
# Get your Measurement ID from Google Analytics 4 dashboard
# Format: G-XXXXXXXXXX
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# OPENAI (Optional - for AI features)
# ============================================
# Only needed if you're using AI-powered product extraction
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ADVANCED_FEATURES=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## How to Get Each Value

### 1. NeonDB (DATABASE_URL)

1. Go to https://console.neon.tech
2. Sign in and create/select your project
3. Go to your project dashboard
4. Click "Connection Details" or find the connection string
5. Copy the connection string
6. Ensure it includes `?sslmode=require` at the end

**Format:** `postgresql://username:password@hostname.neon.tech/database?sslmode=require`

### 2. Cloudflare R2

#### R2_ACCOUNT_ID
1. Go to Cloudflare Dashboard
2. Select your account
3. The Account ID is shown in the right sidebar

#### R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY
1. Go to Cloudflare Dashboard → R2
2. Click "Manage R2 API Tokens"
3. Click "Create API Token"
4. Set permissions: Read & Write
5. Copy the Access Key ID and Secret Access Key (shown only once!)

#### R2_BUCKET_NAME
- The name you gave your R2 bucket when creating it

#### R2_PUBLIC_URL
- If using default: `https://{account-id}.r2.cloudflarestorage.com/{bucket-name}`
- If using custom domain: Your custom domain URL (e.g., `https://cdn.yourdomain.com`)

### 3. Emailit

#### EMAILIT_API_KEY
1. Go to Emailit dashboard
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (starts with `eit_` or similar)

#### EMAILIT_FROM_EMAIL
- Your verified sender email address (e.g., `notifications@yourdomain.com`)
- Must be verified in Emailit dashboard

#### EMAILIT_FROM_NAME
- Display name shown in email clients (e.g., "Your App Name")

### 4. Application Settings

#### VITE_APP_NAME
- Your application name (e.g., "eComJunction", "Shopmatic")

#### VITE_APP_URL / VITE_PRODUCTION_URL
- Your production domain URL (e.g., `https://yourdomain.com`)
- Must include `https://` protocol

#### VITE_DOMAIN
- Your domain name without protocol (e.g., `yourdomain.com`)

### 5. Security

#### VITE_JWT_SECRET
Generate a strong random secret:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**IMPORTANT:** 
- Use a different secret for production vs development
- Never commit this to version control
- Minimum 32 characters recommended

### 6. OpenAI (Optional)

#### VITE_OPENAI_API_KEY
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Only needed if using AI-powered features

---

## Environment-Specific Files

You can create different `.env` files for different environments:

- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment

---

## Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS:**

1. **Never commit `.env` files to version control**
   - Ensure `.env` is in your `.gitignore`

2. **Use different secrets for each environment**
   - Development, staging, and production should have different JWT secrets

3. **Rotate secrets regularly**
   - Especially if they've been exposed or compromised

4. **Use environment variables in your hosting platform**
   - Vercel, Netlify, Railway, etc. have secure environment variable storage

5. **Restrict R2 API token permissions**
   - Only grant the minimum permissions needed

---

## Verification

After setting up your `.env` file, verify it's working:

```bash
# Test database connection
npm run db:test

# Test email service (if test script exists)
npm run test:email

# Build the application
npm run build
```

If any test fails, check that:
- All required variables are set
- Values are correct (no extra spaces, quotes, etc.)
- Environment variables are accessible to the application


import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { config } from '../config/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 forgot password requests per hour per IP
  message: { error: 'Too many password reset attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', registrationRateLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);
    
    // Create user
    const userResult = await query(
      `INSERT INTO users (email, first_name, last_name, role, subscription_plan) 
       VALUES ($1, $2, $3, 'affiliate_marketer', 'free') 
       RETURNING id, email, first_name, last_name, role, subscription_plan, created_at`,
      [email.toLowerCase(), firstName || null, lastName || null]
    );
    const user = userResult.rows[0];
    
    // Create password record
    await query(
      'INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)',
      [user.id, passwordHash]
    );
    
    // Create email verification token
    const verificationToken = uuidv4();
    await query(
      `INSERT INTO email_verifications (user_id, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, verificationToken]
    );
    
    // Create session
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, subscriptionPlan: user.subscription_plan },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    await query(
      `INSERT INTO user_sessions (user_id, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, token]
    );
    
    // TODO: Send verification email
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionPlan: user.subscription_plan,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', authRateLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user with password
    const result = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.subscription_plan, u.is_active,
              p.password_hash
       FROM users u
       JOIN user_passwords p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create session
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, subscriptionPlan: user.subscription_plan },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    await query(
      `INSERT INTO user_sessions (user_id, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, token]
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionPlan: user.subscription_plan,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization!;
    const token = authHeader.split(' ')[1];
    
    await query(
      'UPDATE user_sessions SET is_active = false WHERE token = $1',
      [token]
    );
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, bio, avatar_url, website_url, 
              social_links, theme_settings, role, subscription_plan, is_active, email_verified, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      websiteUrl: user.website_url,
      socialLinks: user.social_links,
      themeSettings: user.theme_settings,
      role: user.role,
      subscriptionPlan: user.subscription_plan,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    const result = await query(
      `SELECT user_id FROM email_verifications 
       WHERE token = $1 AND verified = false AND expires_at > NOW()`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    const userId = result.rows[0].user_id;
    
    await query('UPDATE users SET email_verified = true WHERE id = $1', [userId]);
    await query('UPDATE email_verifications SET verified = true WHERE user_id = $1', [userId]);
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.post('/forgot-password', forgotPasswordRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    const userId = result.rows[0].id;
    const resetToken = uuidv4();
    
    await query(
      `INSERT INTO password_resets (user_id, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [userId, resetToken]
    );
    
    // TODO: Send email with reset link
    // const resetLink = `${config.frontend.url}/reset-password?token=${resetToken}`;
    
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});

router.post('/reset-password', forgotPasswordRateLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const result = await query(
      `SELECT user_id FROM password_resets 
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const userId = result.rows[0].user_id;
    const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);
    
    await query('UPDATE user_passwords SET password_hash = $1 WHERE user_id = $2', [passwordHash, userId]);
    await query('UPDATE password_resets SET used = true WHERE user_id = $1', [userId]);
    
    // Invalidate all sessions
    await query('UPDATE user_sessions SET is_active = false WHERE user_id = $1', [userId]);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});

export default router;

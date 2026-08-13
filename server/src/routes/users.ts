import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { normalizeUsername, validateUsername } from '../utils/username.js';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  socialLinks: z.record(z.any()).optional(),
  username: z.string().min(3).max(30).optional(),
});

function mapUserRow(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username || null,
    firstName: user.first_name,
    lastName: user.last_name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    websiteUrl: user.website_url,
    socialLinks: user.social_links,
    role: user.role,
    subscriptionPlan: user.subscription_plan,
    createdAt: user.created_at,
  };
}

// Public, lightly rate-limited. Used by the first-hour wizard for live checks.
// GET /api/users/check-username/:username → { available: boolean, reason?: string }
const usernameCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many username checks, please try again shortly' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/check-username/:username', usernameCheckLimiter, async (req, res: Response) => {
  try {
    const validation = validateUsername(req.params.username);
    if (!validation.valid) {
      return res.json({ available: false, reason: validation.error });
    }

    const username = normalizeUsername(req.params.username);
    const result = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.json({ available: true });
    }

    return res.json({ available: false, reason: 'Username is already taken' });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Authorization: Can only view own profile unless admin
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await query(
      `SELECT id, email, username, first_name, last_name, bio, avatar_url, website_url, 
              social_links, role, subscription_plan, created_at
       FROM users WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(mapUserRow(result.rows[0]));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Can only update own profile (or admin)
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot update another user\'s profile' });
    }
    
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { firstName, lastName, bio, avatarUrl, websiteUrl, socialLinks, username: rawUsername } = parsed.data;

    let username: string | undefined;
    if (rawUsername !== undefined) {
      const validation = validateUsername(rawUsername);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      username = normalizeUsername(rawUsername);
    }
    
    const result = await query(
      `UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        bio = COALESCE($3, bio),
        avatar_url = COALESCE($4, avatar_url),
        website_url = COALESCE($5, website_url),
        social_links = COALESCE($6, social_links),
        username = COALESCE($7, username)
       WHERE id = $8
       RETURNING id, email, username, first_name, last_name, bio, avatar_url, website_url, social_links, role, subscription_plan, created_at`,
      [firstName, lastName, bio, avatarUrl, websiteUrl, socialLinks, username, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(mapUserRow(result.rows[0]));
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Can only delete own account (or admin)
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot delete another user\'s account' });
    }
    
    // Soft delete
    await query('UPDATE users SET is_active = false WHERE id = $1', [id]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

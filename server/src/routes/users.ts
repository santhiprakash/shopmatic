import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  socialLinks: z.record(z.any()).optional(),
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Authorization: Can only view own profile unless admin
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await query(
      `SELECT id, email, first_name, last_name, bio, avatar_url, website_url, 
              social_links, role, subscription_plan, created_at
       FROM users WHERE id = $1 AND is_active = true`,
      [id]
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
      role: user.role,
      subscriptionPlan: user.subscription_plan,
      createdAt: user.created_at,
    });
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
    
    const { firstName, lastName, bio, avatarUrl, websiteUrl, socialLinks } = req.body;
    
    const result = await query(
      `UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        bio = COALESCE($3, bio),
        avatar_url = COALESCE($4, avatar_url),
        website_url = COALESCE($5, website_url),
        social_links = COALESCE($6, social_links)
       WHERE id = $7
       RETURNING id, email, first_name, last_name, bio, avatar_url, website_url, social_links`,
      [firstName, lastName, bio, avatarUrl, websiteUrl, socialLinks, id]
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
    });
  } catch (error) {
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

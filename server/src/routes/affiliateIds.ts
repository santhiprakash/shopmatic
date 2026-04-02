import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const createAffiliateIdSchema = z.object({
  platform: z.string().min(1).max(50),
  affiliateId: z.string().min(1).max(255),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM affiliate_ids WHERE user_id = $1 AND is_active = true ORDER BY platform',
      [req.user!.id]
    );
    
    res.json({
      affiliateIds: result.rows.map(a => ({
        id: a.id,
        platform: a.platform,
        affiliateId: a.affiliate_id,
        isActive: a.is_active,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
    });
  } catch (error) {
    console.error('Get affiliate IDs error:', error);
    res.status(500).json({ error: 'Failed to get affiliate IDs' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { platform, affiliateId } = req.body;
    
    const result = await query(
      `INSERT INTO affiliate_ids (user_id, platform, affiliate_id) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, platform) DO UPDATE 
       SET affiliate_id = $3, updated_at = NOW()
       RETURNING *`,
      [req.user!.id, platform, affiliateId]
    );
    
    const a = result.rows[0];
    res.status(201).json({
      id: a.id,
      platform: a.platform,
      affiliateId: a.affiliate_id,
      isActive: a.is_active,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    });
  } catch (error) {
    console.error('Create affiliate ID error:', error);
    res.status(500).json({ error: 'Failed to create affiliate ID' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE affiliate_ids SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Affiliate ID not found' });
    }
    
    res.json({ message: 'Affiliate ID deleted successfully' });
  } catch (error) {
    console.error('Delete affiliate ID error:', error);
    res.status(500).json({ error: 'Failed to delete affiliate ID' });
  }
});

export default router;

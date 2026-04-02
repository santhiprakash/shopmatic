import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [req.user!.id]
    );
    
    res.json({
      categories: result.rows.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    
    const result = await query(
      `INSERT INTO categories (user_id, name, color) 
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user!.id, name, color || '#3B82F6']
    );
    
    const c = result.rows[0];
    res.status(201).json({
      id: c.id,
      name: c.name,
      color: c.color,
      createdAt: c.created_at,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;

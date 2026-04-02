import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  affiliateUrl: z.string().url(),
  originalUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional().nullable(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  commissionRate: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  platform: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category, platform, search, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category_name, c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category = c.name AND p.user_id = c.user_id
      WHERE p.user_id = $1 AND p.is_active = true
    `;
    const params: any[] = [req.user!.id];
    let paramIndex = 2;
    
    if (category) {
      sql += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (platform) {
      sql += ` AND p.platform = $${paramIndex}`;
      params.push(platform);
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const result = await query(sql, params);
    
    res.json({
      products: result.rows.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        affiliateUrl: p.affiliate_url,
        originalUrl: p.original_url,
        imageUrl: p.image_url,
        category: p.category,
        categoryName: p.category_name,
        categoryColor: p.category_color,
        tags: p.tags,
        commissionRate: p.commission_rate,
        rating: p.rating,
        platform: p.platform,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT p.*, c.name as category_name, c.color as category_color
       FROM products p
       LEFT JOIN categories c ON p.category = c.name AND p.user_id = c.user_id
       WHERE p.id = $1 AND p.user_id = $2 AND p.is_active = true`,
      [id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const p = result.rows[0];
    res.json({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      affiliateUrl: p.affiliate_url,
      originalUrl: p.original_url,
      imageUrl: p.image_url,
      category: p.category,
      categoryName: p.category_name,
      categoryColor: p.category_color,
      tags: p.tags,
      commissionRate: p.commission_rate,
      rating: p.rating,
      platform: p.platform,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, description, price, currency, affiliateUrl, originalUrl,
      imageUrl, category, tags, commissionRate, rating, platform
    } = req.body;
    
    const result = await query(
      `INSERT INTO products 
        (user_id, title, description, price, currency, affiliate_url, original_url,
         image_url, category, tags, commission_rate, rating, platform)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [req.user!.id, title, description, price, currency || 'USD', affiliateUrl,
       originalUrl, imageUrl, category, tags || [], commissionRate, rating, platform]
    );
    
    const p = result.rows[0];
    res.status(201).json({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      affiliateUrl: p.affiliate_url,
      originalUrl: p.original_url,
      imageUrl: p.image_url,
      category: p.category,
      tags: p.tags,
      commissionRate: p.commission_rate,
      rating: p.rating,
      platform: p.platform,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const allowedFields = [
      'title', 'description', 'price', 'currency', 'affiliate_url', 'original_url',
      'image_url', 'category', 'tags', 'commission_rate', 'rating', 'platform'
    ];
    
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(id, req.user!.id);
    const result = await query(
      `UPDATE products SET ${setClauses.join(', ')} 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const p = result.rows[0];
    res.json({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      affiliateUrl: p.affiliate_url,
      originalUrl: p.original_url,
      imageUrl: p.image_url,
      category: p.category,
      tags: p.tags,
      commissionRate: p.commission_rate,
      rating: p.rating,
      platform: p.platform,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE products SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

import { Router, Response } from 'express';
import { query, getClient } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const createPageSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().min(5).max(30).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/).optional(),
  description: z.string().max(500).optional(),
  bio: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

const updatePageSchema = createPageSchema.partial();

// Helper to generate slug
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 25);
  const random = Math.random().toString(36).substring(2, 7);
  return `${base}-${random}`;
}

// Check if user can create page
async function canCreatePage(userId: string): Promise<boolean> {
  const result = await query(
    'SELECT max_pages FROM user_page_limits WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    // No limits defined, allow creation
    return true;
  }
  
  const { max_pages, pages_created } = result.rows[0];
  if (max_pages === -1) return true; // Unlimited
  return pages_created < max_pages;
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, pc.role as user_role
       FROM pages p
       JOIN page_collaborators pc ON p.id = pc.page_id
       WHERE pc.user_id = $1 AND pc.is_active = true AND p.is_active = true
       ORDER BY p.created_at DESC`,
      [req.user!.id]
    );
    
    res.json({
      pages: result.rows.map(p => ({
        id: p.id,
        userId: p.user_id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        bio: p.bio,
        avatarUrl: p.avatar_url,
        coverImageUrl: p.cover_image_url,
        themeSettings: p.theme_settings,
        socialLinks: p.social_links,
        isActive: p.is_active,
        isPublic: p.is_public,
        viewCount: p.view_count,
        userRole: p.user_role,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Failed to get pages' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT p.*, u.first_name, u.last_name, u.avatar_url
       FROM pages p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.is_active = true AND p.is_public = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const p = result.rows[0];
    res.json({
      id: p.id,
      userId: p.user_id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      bio: p.bio,
      avatarUrl: p.avatar_url,
      coverImageUrl: p.cover_image_url,
      themeSettings: p.theme_settings,
      socialLinks: p.social_links,
      isActive: p.is_active,
      isPublic: p.is_public,
      viewCount: p.view_count,
      owner: {
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
      },
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await query(
      `SELECT p.*, u.first_name, u.last_name, u.avatar_url
       FROM pages p
       JOIN users u ON p.user_id = u.id
       WHERE p.slug = $1 AND p.is_active = true AND p.is_public = true`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const p = result.rows[0];
    
    // Get page products
    const productsResult = await query(
      `SELECT pp.display_order, pp.is_featured, p.*
       FROM page_products pp
       JOIN products p ON pp.product_id = p.id
       WHERE pp.page_id = $1 AND p.is_active = true
       ORDER BY pp.display_order`,
      [p.id]
    );
    
    res.json({
      id: p.id,
      userId: p.user_id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      bio: p.bio,
      avatarUrl: p.avatar_url,
      coverImageUrl: p.cover_image_url,
      themeSettings: p.theme_settings,
      socialLinks: p.social_links,
      isActive: p.is_active,
      isPublic: p.is_public,
      viewCount: p.view_count,
      owner: {
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
      },
      products: productsResult.rows.map(prod => ({
        id: prod.id,
        title: prod.title,
        description: prod.description,
        price: prod.price,
        currency: prod.currency,
        affiliateUrl: prod.affiliate_url,
        imageUrl: prod.image_url,
        category: prod.category,
        tags: prod.tags,
        rating: prod.rating,
        platform: prod.platform,
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug: requestedSlug, description, bio, isPublic } = req.body;
    
    // Check page limits
    const canCreate = await canCreatePage(req.user!.id);
    if (!canCreate) {
      return res.status(403).json({ error: 'Page limit reached for your plan' });
    }
    
    // Generate or validate slug
    let slug = requestedSlug || generateSlug(title);
    
    // Check slug availability
    const slugCheck = await query('SELECT id FROM pages WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      if (!requestedSlug) {
        slug = generateSlug(title);
      } else {
        return res.status(409).json({ error: 'Slug already taken' });
      }
    }
    
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `INSERT INTO pages (user_id, slug, title, description, bio, is_public)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user!.id, slug, title, description, bio, isPublic ?? true]
      );
      
      const p = result.rows[0];
      
      // Add user as owner (trigger should do this, but being explicit)
      await client.query(
        `INSERT INTO page_collaborators (page_id, user_id, role, invited_by, accepted_at)
         VALUES ($1, $2, 'owner', $2, NOW())
         ON CONFLICT (page_id, user_id) DO NOTHING`,
        [p.id, req.user!.id]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        id: p.id,
        userId: p.user_id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        bio: p.bio,
        avatarUrl: p.avatar_url,
        coverImageUrl: p.cover_image_url,
        themeSettings: p.theme_settings,
        socialLinks: p.social_links,
        isActive: p.is_active,
        isPublic: p.is_public,
        viewCount: p.view_count,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check permission (owner or admin)
    const permCheck = await query(
      `SELECT pc.role FROM page_collaborators pc
       WHERE pc.page_id = $1 AND pc.user_id = $2 AND pc.is_active = true`,
      [id, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin'].includes(permCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Build dynamic update
    const allowedFields = ['title', 'description', 'bio', 'is_public'];
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
    
    values.push(id);
    const result = await query(
      `UPDATE pages SET ${setClauses.join(', ')} 
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const p = result.rows[0];
    res.json({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      bio: p.bio,
      avatarUrl: p.avatar_url,
      coverImageUrl: p.cover_image_url,
      themeSettings: p.theme_settings,
      socialLinks: p.social_links,
      isActive: p.is_active,
      isPublic: p.is_public,
      viewCount: p.view_count,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Only owner can delete
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [id, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || permCheck.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can delete a page' });
    }
    
    await query('UPDATE pages SET is_active = false WHERE id = $1', [id]);
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// Page products management
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT pp.display_order, pp.is_featured, p.*
       FROM page_products pp
       JOIN products p ON pp.product_id = p.id
       WHERE pp.page_id = $1 AND p.is_active = true
       ORDER BY pp.display_order`,
      [id]
    );
    
    res.json({
      products: result.rows.map(prod => ({
        displayOrder: prod.display_order,
        isFeatured: prod.is_featured,
        id: prod.id,
        title: prod.title,
        description: prod.description,
        price: prod.price,
        currency: prod.currency,
        affiliateUrl: prod.affiliate_url,
        imageUrl: prod.image_url,
        category: prod.category,
        tags: prod.tags,
        rating: prod.rating,
        platform: prod.platform,
      })),
    });
  } catch (error) {
    console.error('Get page products error:', error);
    res.status(500).json({ error: 'Failed to get page products' });
  }
});

router.post('/:id/products', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { productId, displayOrder, isFeatured } = req.body;
    
    // Check permission (editor or higher)
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [id, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin', 'editor'].includes(permCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const result = await query(
      `INSERT INTO page_products (page_id, product_id, display_order, is_featured)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (page_id, product_id) DO UPDATE 
       SET display_order = $3, is_featured = $4
       RETURNING *`,
      [id, productId, displayOrder || 0, isFeatured || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add page product error:', error);
    res.status(500).json({ error: 'Failed to add product to page' });
  }
});

router.delete('/:id/products/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id, productId } = req.params;
    
    // Check permission (editor or higher)
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [id, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin', 'editor'].includes(permCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    await query(
      'DELETE FROM page_products WHERE page_id = $1 AND product_id = $2',
      [id, productId]
    );
    
    res.json({ message: 'Product removed from page' });
  } catch (error) {
    console.error('Remove page product error:', error);
    res.status(500).json({ error: 'Failed to remove product from page' });
  }
});

export default router;

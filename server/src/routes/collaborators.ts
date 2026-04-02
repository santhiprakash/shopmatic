import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get collaborators for a page
router.get('/pages/:pageId/collaborators', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    
    // Check if user has access to this page
    const accessCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [pageId, req.user!.id]
    );
    
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await query(
      `SELECT pc.*, u.email, u.first_name, u.last_name, u.avatar_url,
              inv.email as invited_email
       FROM page_collaborators pc
       JOIN users u ON pc.user_id = u.id
       LEFT JOIN page_invitations inv ON inv.page_id = pc.page_id AND inv.email = u.email AND inv.accepted = true
       WHERE pc.page_id = $1 AND pc.is_active = true
       ORDER BY pc.role = 'owner' DESC, pc.invited_at`,
      [pageId]
    );
    
    res.json({
      collaborators: result.rows.map(c => ({
        id: c.id,
        pageId: c.page_id,
        userId: c.user_id,
        role: c.role,
        email: c.email,
        firstName: c.first_name,
        lastName: c.last_name,
        avatarUrl: c.avatar_url,
        invitedBy: c.invited_by,
        invitedAt: c.invited_at,
        acceptedAt: c.accepted_at,
        isActive: c.is_active,
      })),
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: 'Failed to get collaborators' });
  }
});

// Invite a member to a page
router.post('/pages/:pageId/collaborators', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const { email, role } = req.body;
    
    // Check if user can invite (owner or admin)
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [pageId, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin'].includes(permCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    if (role === 'owner') {
      return res.status(400).json({ error: 'Cannot invite as owner' });
    }
    
    // Check team limits
    const limitCheck = await query(
      'SELECT max_members, current_members FROM team_member_limits WHERE page_id = $1',
      [pageId]
    );
    
    if (limitCheck.rows.length > 0) {
      const { max_members, current_members } = limitCheck.rows[0];
      if (max_members !== -1 && current_members >= max_members + 1) {
        return res.status(403).json({ error: 'Team member limit reached' });
      }
    }
    
    // Check if user already has access
    const existingUser = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      const existingCollaborator = await query(
        `SELECT id FROM page_collaborators 
         WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
        [pageId, existingUser.rows[0].id]
      );
      
      if (existingCollaborator.rows.length > 0) {
        return res.status(409).json({ error: 'User is already a collaborator' });
      }
    }
    
    // Check for pending invitation
    const pendingInvite = await query(
      `SELECT id FROM page_invitations 
       WHERE page_id = $1 AND email = $2 AND accepted = false AND expires_at > NOW()`,
      [pageId, email.toLowerCase()]
    );
    
    if (pendingInvite.rows.length > 0) {
      return res.status(409).json({ error: 'Invitation already pending for this email' });
    }
    
    // Create invitation token
    const token = uuidv4();
    await query(
      `INSERT INTO page_invitations (page_id, email, role, invited_by, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
      [pageId, email.toLowerCase(), role, req.user!.id, token]
    );
    
    // TODO: Send invitation email
    
    res.status(201).json({
      message: 'Invitation sent',
      token, // For debugging, remove in production
    });
  } catch (error) {
    console.error('Invite collaborator error:', error);
    res.status(500).json({ error: 'Failed to invite collaborator' });
  }
});

// Update collaborator role
router.patch('/collaborators/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (role === 'owner') {
      return res.status(400).json({ error: 'Cannot change role to owner' });
    }
    
    // Get the collaborator's page
    const collab = await query(
      'SELECT page_id, role FROM page_collaborators WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (collab.rows.length === 0) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }
    
    const pageId = collab.rows[0].page_id;
    
    // Check if user can manage roles (owner or admin)
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [pageId, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin'].includes(permCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const result = await query(
      `UPDATE page_collaborators SET role = $1 WHERE id = $2 RETURNING *`,
      [role, id]
    );
    
    res.json({
      id: result.rows[0].id,
      role: result.rows[0].role,
    });
  } catch (error) {
    console.error('Update collaborator error:', error);
    res.status(500).json({ error: 'Failed to update collaborator' });
  }
});

// Remove collaborator
router.delete('/collaborators/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the collaborator's page and role
    const collab = await query(
      'SELECT page_id, role, user_id FROM page_collaborators WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (collab.rows.length === 0) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }
    
    const { page_id, role, user_id } = collab.rows[0];
    
    // Cannot remove owner
    if (role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove the owner' });
    }
    
    // Check if user can remove members (owner or admin)
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [page_id, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin'].includes(permCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Cannot remove yourself if you're not owner/admin
    if (user_id === req.user!.id && permCheck.rows[0].role !== 'owner') {
      return res.status(400).json({ error: 'Cannot remove yourself (need owner to remove)' });
    }
    
    await query(
      'UPDATE page_collaborators SET is_active = false WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// Get pending invitations for a page
router.get('/pages/:pageId/invitations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    
    // Check if user has access
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [pageId, req.user!.id]
    );
    
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await query(
      `SELECT * FROM page_invitations 
       WHERE page_id = $1 AND accepted = false AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [pageId]
    );
    
    res.json({
      invitations: result.rows.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
      })),
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
});

// Cancel an invitation
router.delete('/invitations/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get invitation
    const inv = await query(
      'SELECT page_id, invited_by FROM page_invitations WHERE id = $1 AND accepted = false',
      [id]
    );
    
    if (inv.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    const { page_id, invited_by } = inv.rows[0];
    
    // Check if user can cancel (inviter, page owner, or page admin)
    const permCheck = await query(
      `SELECT role FROM page_collaborators
       WHERE page_id = $1 AND user_id = $2 AND is_active = true`,
      [page_id, req.user!.id]
    );
    
    if (permCheck.rows.length === 0 || !['owner', 'admin'].includes(permCheck.rows[0].role)) {
      if (invited_by !== req.user!.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }
    
    await query('DELETE FROM page_invitations WHERE id = $1', [id]);
    
    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

// Accept invitation
router.post('/invitations/:token/accept', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    
    // Get invitation
    const inv = await query(
      `SELECT * FROM page_invitations 
       WHERE token = $1 AND accepted = false AND expires_at > NOW()`,
      [token]
    );
    
    if (inv.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }
    
    const invitation = inv.rows[0];
    
    // Get user email
    const userResult = await query('SELECT email FROM users WHERE id = $1', [req.user!.id]);
    const userEmail = userResult.rows[0].email.toLowerCase();
    
    // Check if invitation email matches user
    if (invitation.email !== userEmail) {
      return res.status(403).json({ error: 'This invitation was sent to a different email' });
    }
    
    // Add user as collaborator
    await query(
      `INSERT INTO page_collaborators (page_id, user_id, role, invited_by, accepted_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (page_id, user_id) DO UPDATE SET is_active = true, accepted_at = NOW()`,
      [invitation.page_id, req.user!.id, invitation.role, invitation.invited_by]
    );
    
    // Mark invitation as accepted
    await query(
      'UPDATE page_invitations SET accepted = true, accepted_by = $1, accepted_at = NOW() WHERE id = $2',
      [req.user!.id, invitation.id]
    );
    
    res.json({ message: 'Invitation accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

export default router;

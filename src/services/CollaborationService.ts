/**
 * Collaboration Service
 * Handles all API operations for pages, team members, and invitations
 *
 * ARCHITECTURE NOTE:
 * This service uses NeonDB (PostgreSQL) as the database backend.
 * All database operations are performed through backend API endpoints,
 * NOT directly from the client-side code for security reasons.
 *
 * Required Backend API Endpoints:
 * - POST   /api/pages - Create page
 * - GET    /api/pages?userId=:userId - Get user pages
 * - GET    /api/pages/:pageId - Get page by ID
 * - GET    /api/pages/slug/:slug - Get page by slug
 * - PATCH  /api/pages/:pageId - Update page
 * - DELETE /api/pages/:pageId - Delete page (soft delete)
 * - GET    /api/pages/:pageId/collaborators - Get collaborators
 * - GET    /api/pages/:pageId/collaborators/:userId/role - Get user role
 * - POST   /api/pages/:pageId/collaborators - Add collaborator
 * - PATCH  /api/collaborators/:collaboratorId/role - Update role
 * - DELETE /api/collaborators/:collaboratorId - Remove collaborator
 * - POST   /api/pages/:pageId/invitations - Create invitation
 * - GET    /api/pages/:pageId/invitations - Get pending invitations
 * - GET    /api/invitations/:token - Get invitation by token
 * - POST   /api/invitations/:token/accept - Accept invitation
 * - DELETE /api/invitations/:invitationId - Cancel invitation
 * - GET    /api/pages/:pageId/team-limits - Get team limits
 */

import { Database } from '@/lib/neondb';
import { PageCollaborator, PageInvitation, Page, PageFormData, InviteMemberFormData, TeamMemberLimits, PageRole } from '@/types';
import { apiRequest, showApiErrorToast, handleApiError } from '@/utils/apiErrorHandler';
import { csrfFetch, initializeCSRFToken, getCSRFHeaders } from '@/utils/csrf';

// Type aliases for cleaner code
type PageRow = Database['public']['Tables']['pages']['Row'];
type PageInsert = Database['public']['Tables']['pages']['Insert'];
type PageUpdate = Database['public']['Tables']['pages']['Update'];

type CollaboratorRow = Database['public']['Tables']['page_collaborators']['Row'];
type CollaboratorInsert = Database['public']['Tables']['page_collaborators']['Insert'];
type CollaboratorUpdate = Database['public']['Tables']['page_collaborators']['Update'];

type InvitationRow = Database['public']['Tables']['page_invitations']['Row'];
type InvitationInsert = Database['public']['Tables']['page_invitations']['Insert'];

type LimitsRow = Database['public']['Tables']['team_member_limits']['Row'];

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class CollaborationService {
  // ============================================================================
  // PAGE OPERATIONS
  // ============================================================================

  /**
   * Create a new page
   */
  async createPage(userId: string, pageData: PageFormData): Promise<Page> {
    const data = await apiRequest<PageRow>(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...pageData }),
      retries: 1,
    });

    return this.mapPageRowToPage(data);
  }

  /**
   * Get all pages for a user
   */
  async getUserPages(userId: string): Promise<Page[]> {
    const data = await apiRequest<PageRow[]>(`${API_BASE_URL}/pages?userId=${userId}`, {
      method: 'GET',
      retries: 1,
    });

    return (data || []).map(this.mapPageRowToPage);
  }

  /**
   * Get a single page by ID
   */
  async getPageById(pageId: string): Promise<Page | null> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get page' }));
      throw new Error(error.message || 'Failed to get page');
    }

    const data = await response.json();
    return this.mapPageRowToPage(data);
  }

  /**
   * Get a page by slug
   */
  async getPageBySlug(slug: string): Promise<Page | null> {
    const response = await fetch(`${API_BASE_URL}/pages/slug/${slug}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get page' }));
      throw new Error(error.message || 'Failed to get page');
    }

    const data = await response.json();
    return this.mapPageRowToPage(data);
  }

  /**
   * Update a page
   */
  async updatePage(pageId: string, pageData: Partial<PageFormData>): Promise<Page> {
    initializeCSRFToken();
    const csrfHeaders = getCSRFHeaders();
    
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(pageData),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update page' }));
      throw new Error(error.message || 'Failed to update page');
    }

    const data = await response.json();
    return this.mapPageRowToPage(data);
  }

  /**
   * Delete a page (soft delete)
   */
  async deletePage(pageId: string): Promise<void> {
    initializeCSRFToken();
    const csrfHeaders = getCSRFHeaders();
    
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
      method: 'DELETE',
      headers: csrfHeaders,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete page' }));
      throw new Error(error.message || 'Failed to delete page');
    }
  }

  // ============================================================================
  // COLLABORATOR OPERATIONS
  // ============================================================================

  /**
   * Get all collaborators for a page
   */
  async getCollaborators(pageId: string): Promise<PageCollaborator[]> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/collaborators`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get collaborators' }));
      throw new Error(error.message || 'Failed to get collaborators');
    }

    const data = await response.json();
    return (data || []).map(this.mapCollaboratorRowToCollaborator);
  }

  /**
   * Get user's role on a page
   */
  async getUserRole(pageId: string, userId: string): Promise<PageRole | null> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/collaborators/${userId}/role`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get user role' }));
      throw new Error(error.message || 'Failed to get user role');
    }

    const data = await response.json();
    return data.role as PageRole;
  }

  /**
   * Add a collaborator to a page
   */
  async addCollaborator(
    pageId: string,
    userId: string,
    role: PageRole,
    invitedBy: string
  ): Promise<PageCollaborator> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, invitedBy }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add collaborator' }));
      throw new Error(error.message || 'Failed to add collaborator');
    }

    const data = await response.json();
    return this.mapCollaboratorRowToCollaborator(data);
  }

  /**
   * Update collaborator role
   */
  async updateCollaboratorRole(
    collaboratorId: string,
    newRole: PageRole
  ): Promise<PageCollaborator> {
    initializeCSRFToken();
    const csrfHeaders = getCSRFHeaders();
    
    const response = await fetch(`${API_BASE_URL}/collaborators/${collaboratorId}/role`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify({ role: newRole }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update collaborator role' }));
      throw new Error(error.message || 'Failed to update collaborator role');
    }

    const data = await response.json();
    return this.mapCollaboratorRowToCollaborator(data);
  }

  /**
   * Remove a collaborator (soft delete)
   */
  async removeCollaborator(collaboratorId: string): Promise<void> {
    initializeCSRFToken();
    const csrfHeaders = getCSRFHeaders();
    
    const response = await fetch(`${API_BASE_URL}/collaborators/${collaboratorId}`, {
      method: 'DELETE',
      headers: csrfHeaders,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove collaborator' }));
      throw new Error(error.message || 'Failed to remove collaborator');
    }
  }

  // ============================================================================
  // INVITATION OPERATIONS
  // ============================================================================

  /**
   * Create a new invitation
   */
  async createInvitation(
    pageId: string,
    inviteData: InviteMemberFormData,
    invitedBy: string,
    token: string
  ): Promise<PageInvitation> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...inviteData, invitedBy, token }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create invitation' }));
      throw new Error(error.message || 'Failed to create invitation');
    }

    const data = await response.json();
    return this.mapInvitationRowToInvitation(data);
  }

  /**
   * Get pending invitations for a page
   */
  async getPendingInvitations(pageId: string): Promise<PageInvitation[]> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/invitations`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get invitations' }));
      throw new Error(error.message || 'Failed to get invitations');
    }

    const data = await response.json();
    return (data || []).map(this.mapInvitationRowToInvitation);
  }

  /**
   * Get invitation by token
   */
  async getInvitationByToken(token: string): Promise<PageInvitation | null> {
    const response = await fetch(`${API_BASE_URL}/invitations/${token}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get invitation' }));
      throw new Error(error.message || 'Failed to get invitation');
    }

    const data = await response.json();
    return this.mapInvitationRowToInvitation(data);
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<PageInvitation> {
    const response = await fetch(`${API_BASE_URL}/invitations/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to accept invitation' }));
      throw new Error(error.message || 'Failed to accept invitation');
    }

    const data = await response.json();
    return this.mapInvitationRowToInvitation(data);
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to cancel invitation' }));
      throw new Error(error.message || 'Failed to cancel invitation');
    }
  }

  // ============================================================================
  // TEAM LIMITS OPERATIONS
  // ============================================================================

  /**
   * Get team limits for a page
   */
  async getTeamLimits(pageId: string): Promise<TeamMemberLimits | null> {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/team-limits`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get team limits' }));
      throw new Error(error.message || 'Failed to get team limits');
    }

    const data = await response.json();
    return this.mapLimitsRowToLimits(data);
  }

  // ============================================================================
  // HELPER MAPPERS
  // ============================================================================

  private mapPageRowToPage(row: PageRow): Page {
    return {
      id: row.id,
      userId: row.user_id,
      slug: row.slug,
      title: row.title,
      description: row.description || undefined,
      bio: row.bio || undefined,
      avatarUrl: row.avatar_url || undefined,
      coverImageUrl: row.cover_image_url || undefined,
      themeSettings: row.theme_settings || undefined,
      socialLinks: row.social_links || undefined,
      isActive: row.is_active,
      isPublic: row.is_public,
      viewCount: row.view_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapCollaboratorRowToCollaborator(row: any): PageCollaborator {
    const user = row.user;
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Unknown User';

    return {
      id: row.id,
      pageId: row.page_id,
      userId: row.user_id,
      role: row.role as PageRole,
      invitedBy: row.invited_by || undefined,
      invitedAt: new Date(row.invited_at),
      acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
      isActive: row.is_active,
      permissions: row.permissions || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      user: user
        ? {
            id: user.id,
            name: fullName,
            email: user.email,
            avatar: user.avatar_url || undefined,
          }
        : undefined,
    };
  }

  private mapInvitationRowToInvitation(row: InvitationRow): PageInvitation {
    return {
      id: row.id,
      pageId: row.page_id,
      email: row.email,
      role: row.role as PageRole,
      invitedBy: row.invited_by,
      token: row.token,
      expiresAt: new Date(row.expires_at),
      accepted: row.accepted,
      acceptedBy: row.accepted_by || undefined,
      acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
      createdAt: new Date(row.created_at),
    };
  }

  private mapLimitsRowToLimits(row: LimitsRow): TeamMemberLimits {
    return {
      pageId: row.page_id,
      maxMembers: row.max_members,
      currentMembers: row.current_members,
      lastUpdated: new Date(row.last_updated),
    };
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
export default collaborationService;

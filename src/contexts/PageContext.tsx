import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  Page,
  PageFormData,
  PageLimits,
  PageCollaborator,
  PageInvitation,
  PageRole,
  TeamMemberLimits,
  InviteMemberFormData
} from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  canAddPage,
  getRemainingPageSlots,
  getPlanLimits,
  canAddTeamMember,
  getRemainingTeamSlots
} from '@/utils/featureGating';
import {
  getUserPageRole,
  hasPagePermission,
  validateCollaborator,
  formatPageRole
} from '@/utils/pagePermissions';
import { SecurityUtils } from '@/utils/security';
import { RESERVED_USERNAMES as RESERVED_SLUGS } from '@/utils/username';

interface PageContextType {
  // Page management
  pages: Page[];
  currentPage: Page | null;
  pageLimits: PageLimits | null;
  isLoading: boolean;
  createPage: (pageData: PageFormData) => Promise<Page | null>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  getPageBySlug: (slug: string) => Page | undefined;
  getPageById: (pageId: string) => Page | undefined;
  setCurrentPage: (page: Page | null) => void;
  canCreatePage: () => boolean;
  remainingPageSlots: number;

  // Collaboration management
  collaborators: Record<string, PageCollaborator[]>; // pageId -> collaborators
  invitations: Record<string, PageInvitation[]>; // pageId -> invitations
  teamLimits: Record<string, TeamMemberLimits>; // pageId -> limits
  getCollaborators: (pageId: string) => PageCollaborator[];
  getPendingInvitations: (pageId: string) => PageInvitation[];
  inviteMember: (pageId: string, inviteData: InviteMemberFormData) => Promise<void>;
  removeMember: (pageId: string, collaboratorId: string) => Promise<void>;
  updateMemberRole: (pageId: string, collaboratorId: string, newRole: PageRole) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  getUserRole: (pageId: string) => PageRole | null;
  canInviteMembers: (pageId: string) => boolean;
  getRemainingTeamSlotsForPage: (pageId: string) => number;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [pageLimits, setPageLimits] = useState<PageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Collaboration state
  const [collaborators, setCollaborators] = useState<Record<string, PageCollaborator[]>>({});
  const [invitations, setInvitations] = useState<Record<string, PageInvitation[]>>({});
  const [teamLimits, setTeamLimits] = useState<Record<string, TeamMemberLimits>>({});

  // Load pages from localStorage on mount (later will be from database)
  useEffect(() => {
    if (!user) {
      setPages([]);
      setPageLimits(null);
      setIsLoading(false);
      return;
    }

    // Load user's pages from localStorage
    const savedPages = localStorage.getItem(`pages_${user.id}`);
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages);
        setPages(parsedPages.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      } catch (error) {
        console.error('Error loading pages:', error);
      }
    }

    // Initialize page limits
    const limits = getPlanLimits(user.plan);
    setPageLimits({
      userId: user.id,
      maxPages: limits.maxPages,
      pagesCreated: savedPages ? JSON.parse(savedPages).length : 0,
      lastUpdated: new Date(),
    });

    setIsLoading(false);
  }, [user]);

  // Save pages to localStorage whenever they change
  useEffect(() => {
    if (user && pages.length >= 0) {
      localStorage.setItem(`pages_${user.id}`, JSON.stringify(pages));

      // Update page limits
      if (pageLimits) {
        setPageLimits({
          ...pageLimits,
          pagesCreated: pages.length,
          lastUpdated: new Date(),
        });
      }
    }
  }, [pages, user]);

  const validateSlug = (slug: string): { valid: boolean; error?: string } => {
    // Check length
    if (slug.length < 5 || slug.length > 30) {
      return { valid: false, error: 'Slug must be between 5 and 30 characters' };
    }

    // Check format (lowercase alphanumeric + hyphens, must start/end with alphanumeric)
    const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!slugRegex.test(slug)) {
      return {
        valid: false,
        error: 'Slug must be lowercase, start and end with a letter or number, and can contain hyphens',
      };
    }

    // Check if reserved
    if (RESERVED_SLUGS.includes(slug)) {
      return { valid: false, error: 'This slug is reserved and cannot be used' };
    }

    // Check if already taken by another user (in real app, check database)
    const existingPage = pages.find(p => p.slug === slug);
    if (existingPage) {
      return { valid: false, error: 'This slug is already in use' };
    }

    return { valid: true };
  };

  const createPage = async (pageData: PageFormData): Promise<Page | null> => {
    if (!user) {
      toast.error('You must be logged in to create a page');
      return null;
    }

    // Check if user can create more pages
    if (!canAddPage(user.plan, pages.length)) {
      const limits = getPlanLimits(user.plan);
      toast.error(
        `You've reached your page limit (${limits.maxPages} pages). Upgrade to create more pages.`
      );
      return null;
    }

    // Validate slug
    const validation = validateSlug(pageData.slug);
    if (!validation.valid) {
      toast.error(validation.error);
      return null;
    }

    // Create new page
    const newPage: Page = {
      id: uuidv4(),
      userId: user.id,
      slug: pageData.slug.toLowerCase(),
      title: pageData.title,
      description: pageData.description,
      bio: pageData.bio,
      avatarUrl: pageData.avatarUrl,
      coverImageUrl: pageData.coverImageUrl,
      themeSettings: pageData.themeSettings || {},
      socialLinks: pageData.socialLinks || {},
      isActive: true,
      isPublic: pageData.isPublic !== false,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPages([...pages, newPage]);

    // Initialize owner as collaborator
    const ownerCollaborator: PageCollaborator = {
      id: uuidv4(),
      pageId: newPage.id,
      userId: user.id,
      role: 'owner',
      invitedBy: user.id,
      invitedAt: new Date(),
      acceptedAt: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };

    setCollaborators(prev => ({
      ...prev,
      [newPage.id]: [ownerCollaborator],
    }));

    // Initialize team limits
    const limits = getPlanLimits(user.plan);
    setTeamLimits(prev => ({
      ...prev,
      [newPage.id]: {
        pageId: newPage.id,
        maxMembers: limits.maxTeamMembersPerPage,
        currentMembers: 1, // Just the owner
        lastUpdated: new Date(),
      },
    }));

    // Initialize empty invitations
    setInvitations(prev => ({
      ...prev,
      [newPage.id]: [],
    }));

    toast.success(`Page created successfully! Your page is now live at /${newPage.slug}`);

    return newPage;
  };

  const updatePage = async (pageId: string, updates: Partial<Page>): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to update a page');
      return;
    }

    const pageToUpdate = pages.find(p => p.id === pageId);
    if (!pageToUpdate) {
      toast.error('Page not found');
      return;
    }

    // Check ownership
    if (pageToUpdate.userId !== user.id && user.role !== 'admin') {
      toast.error('You can only edit your own pages');
      return;
    }

    // If slug is being updated, validate it
    if (updates.slug && updates.slug !== pageToUpdate.slug) {
      const validation = validateSlug(updates.slug);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    const updatedPages = pages.map(p =>
      p.id === pageId
        ? {
            ...p,
            ...updates,
            updatedAt: new Date(),
          }
        : p
    );

    setPages(updatedPages);
    toast.success('Page updated successfully');
  };

  const deletePage = async (pageId: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to delete a page');
      return;
    }

    const pageToDelete = pages.find(p => p.id === pageId);
    if (!pageToDelete) {
      toast.error('Page not found');
      return;
    }

    // Check ownership
    if (pageToDelete.userId !== user.id && user.role !== 'admin') {
      toast.error('You can only delete your own pages');
      return;
    }

    setPages(pages.filter(p => p.id !== pageId));
    toast.success('Page deleted successfully');

    if (currentPage?.id === pageId) {
      setCurrentPage(null);
    }
  };

  const getPageBySlug = (slug: string): Page | undefined => {
    return pages.find(p => p.slug === slug.toLowerCase());
  };

  const getPageById = (pageId: string): Page | undefined => {
    return pages.find(p => p.id === pageId);
  };

  const canCreatePage = (): boolean => {
    if (!user) return false;
    return canAddPage(user.plan, pages.length);
  };

  const remainingPageSlots = user ? getRemainingPageSlots(user.plan, pages.length) : 0;

  // ============================================================================
  // Collaboration Management Functions
  // ============================================================================

  const getCollaborators = (pageId: string): PageCollaborator[] => {
    return collaborators[pageId] || [];
  };

  const getPendingInvitations = (pageId: string): PageInvitation[] => {
    return (invitations[pageId] || []).filter(inv => !inv.accepted);
  };

  const getUserRole = (pageId: string): PageRole | null => {
    if (!user) return null;
    const pageCollaborators = getCollaborators(pageId);
    return getUserPageRole(user.id, pageId, pageCollaborators);
  };

  const canInviteMembers = (pageId: string): boolean => {
    const userRole = getUserRole(pageId);
    if (!userRole) return false;
    return hasPagePermission(userRole, 'canInviteMembers');
  };

  const getRemainingTeamSlotsForPage = (pageId: string): number => {
    if (!user) return 0;
    const teamLimit = teamLimits[pageId];
    if (!teamLimit) return 0;
    return getRemainingTeamSlots(user.plan, teamLimit.currentMembers);
  };

  const inviteMember = async (pageId: string, inviteData: InviteMemberFormData): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to invite members');
      return;
    }

    // Check permission
    const userRole = getUserRole(pageId);
    if (!userRole || !hasPagePermission(userRole, 'canInviteMembers')) {
      toast.error('You do not have permission to invite members');
      return;
    }

    // Get page
    const page = getPageById(pageId);
    if (!page) {
      toast.error('Page not found');
      return;
    }

    // Check team limits
    const teamLimit = teamLimits[pageId];
    if (teamLimit) {
      if (!canAddTeamMember(user.plan, teamLimit.currentMembers)) {
        const limits = getPlanLimits(user.plan);
        if (limits.maxTeamMembersPerPage === 0) {
          toast.error('Upgrade to Pro to add team members');
        } else {
          toast.error(`You've reached your team limit (${limits.maxTeamMembersPerPage} members per page)`);
        }
        return;
      }
    }

    // Validate collaborator
    const pageCollaborators = getCollaborators(pageId);
    const validation = validateCollaborator(
      inviteData.email,
      inviteData.role,
      pageCollaborators,
      userRole
    );

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Check for existing pending invitation
    const existingInvite = (invitations[pageId] || []).find(
      inv => inv.email === inviteData.email && !inv.accepted
    );
    if (existingInvite) {
      toast.error('An invitation has already been sent to this email');
      return;
    }

    // Generate invitation token
    const token = SecurityUtils.generateSecureRandom(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create invitation
    const invitation: PageInvitation = {
      id: uuidv4(),
      pageId,
      email: inviteData.email,
      role: inviteData.role,
      invitedBy: user.id,
      token,
      expiresAt,
      accepted: false,
      createdAt: new Date(),
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
      },
      inviter: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    setInvitations(prev => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), invitation],
    }));

    toast.success(`Invitation sent to ${inviteData.email} as ${formatPageRole(inviteData.role)}`);
  };

  const removeMember = async (pageId: string, collaboratorId: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to remove members');
      return;
    }

    // Check permission
    const userRole = getUserRole(pageId);
    if (!userRole || !hasPagePermission(userRole, 'canRemoveMembers')) {
      toast.error('You do not have permission to remove members');
      return;
    }

    // Get collaborator
    const pageCollaborators = getCollaborators(pageId);
    const collaborator = pageCollaborators.find(c => c.id === collaboratorId);

    if (!collaborator) {
      toast.error('Collaborator not found');
      return;
    }

    // Cannot remove owner
    if (collaborator.role === 'owner') {
      toast.error('Cannot remove the page owner');
      return;
    }

    // Remove collaborator
    setCollaborators(prev => ({
      ...prev,
      [pageId]: (prev[pageId] || []).filter(c => c.id !== collaboratorId),
    }));

    // Update team limits
    setTeamLimits(prev => {
      const currentLimit = prev[pageId];
      if (currentLimit) {
        return {
          ...prev,
          [pageId]: {
            ...currentLimit,
            currentMembers: Math.max(1, currentLimit.currentMembers - 1),
            lastUpdated: new Date(),
          },
        };
      }
      return prev;
    });

    toast.success(`${collaborator.user?.name || collaborator.user?.email} removed from team`);
  };

  const updateMemberRole = async (
    pageId: string,
    collaboratorId: string,
    newRole: PageRole
  ): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to change roles');
      return;
    }

    // Check permission
    const userRole = getUserRole(pageId);
    if (!userRole || !hasPagePermission(userRole, 'canChangeRoles')) {
      toast.error('You do not have permission to change roles');
      return;
    }

    // Get collaborator
    const pageCollaborators = getCollaborators(pageId);
    const collaborator = pageCollaborators.find(c => c.id === collaboratorId);

    if (!collaborator) {
      toast.error('Collaborator not found');
      return;
    }

    // Cannot change owner role
    if (collaborator.role === 'owner') {
      toast.error('Cannot change the owner role');
      return;
    }

    // Cannot change to owner
    if (newRole === 'owner') {
      toast.error('Cannot assign owner role');
      return;
    }

    // Update role
    setCollaborators(prev => ({
      ...prev,
      [pageId]: (prev[pageId] || []).map(c =>
        c.id === collaboratorId
          ? { ...c, role: newRole, updatedAt: new Date() }
          : c
      ),
    }));

    toast.success(
      `${collaborator.user?.name || collaborator.user?.email} role changed to ${formatPageRole(newRole)}`
    );
  };

  const acceptInvitation = async (token: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to accept invitations');
      return;
    }

    // Find invitation
    let foundInvitation: PageInvitation | null = null;
    let foundPageId: string | null = null;

    for (const pageId in invitations) {
      const invitation = invitations[pageId]?.find(inv => inv.token === token);
      if (invitation) {
        foundInvitation = invitation;
        foundPageId = pageId;
        break;
      }
    }

    if (!foundInvitation || !foundPageId) {
      toast.error('Invalid or expired invitation');
      return;
    }

    // Check if expired
    if (new Date() > foundInvitation.expiresAt) {
      toast.error('This invitation has expired');
      return;
    }

    // Check if email matches
    if (foundInvitation.email !== user.email) {
      toast.error('This invitation was sent to a different email address');
      return;
    }

    // Add as collaborator
    const newCollaborator: PageCollaborator = {
      id: uuidv4(),
      pageId: foundPageId,
      userId: user.id,
      role: foundInvitation.role,
      invitedBy: foundInvitation.invitedBy,
      invitedAt: foundInvitation.createdAt,
      acceptedAt: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };

    setCollaborators(prev => ({
      ...prev,
      [foundPageId]: [...(prev[foundPageId] || []), newCollaborator],
    }));

    // Mark invitation as accepted
    setInvitations(prev => ({
      ...prev,
      [foundPageId]: (prev[foundPageId] || []).map(inv =>
        inv.id === foundInvitation.id
          ? { ...inv, accepted: true, acceptedBy: user.id, acceptedAt: new Date() }
          : inv
      ),
    }));

    // Update team limits
    setTeamLimits(prev => {
      const currentLimit = prev[foundPageId];
      if (currentLimit) {
        return {
          ...prev,
          [foundPageId]: {
            ...currentLimit,
            currentMembers: currentLimit.currentMembers + 1,
            lastUpdated: new Date(),
          },
        };
      }
      return prev;
    });

    const page = getPageById(foundPageId);
    toast.success(`You've joined ${page?.title || 'the page'} as ${formatPageRole(foundInvitation.role)}`);
  };

  const cancelInvitation = async (invitationId: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to cancel invitations');
      return;
    }

    // Find and remove invitation
    for (const pageId in invitations) {
      const invitation = invitations[pageId]?.find(inv => inv.id === invitationId);
      if (invitation) {
        // Check permission
        const userRole = getUserRole(pageId);
        if (!userRole || !hasPagePermission(userRole, 'canInviteMembers')) {
          toast.error('You do not have permission to cancel invitations');
          return;
        }

        setInvitations(prev => ({
          ...prev,
          [pageId]: (prev[pageId] || []).filter(inv => inv.id !== invitationId),
        }));

        toast.success('Invitation cancelled');
        return;
      }
    }

    toast.error('Invitation not found');
  };

  const value: PageContextType = {
    // Page management
    pages,
    currentPage,
    pageLimits,
    isLoading,
    createPage,
    updatePage,
    deletePage,
    getPageBySlug,
    getPageById,
    setCurrentPage,
    canCreatePage,
    remainingPageSlots,

    // Collaboration management
    collaborators,
    invitations,
    teamLimits,
    getCollaborators,
    getPendingInvitations,
    inviteMember,
    removeMember,
    updateMemberRole,
    acceptInvitation,
    cancelInvitation,
    getUserRole,
    canInviteMembers,
    getRemainingTeamSlotsForPage,
  };

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export const usePages = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePages must be used within a PageProvider');
  }
  return context;
};

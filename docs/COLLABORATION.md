# Collaboration System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Role System](#role-system)
5. [Permission Matrix](#permission-matrix)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)
8. [Invitation Flow](#invitation-flow)
9. [Security](#security)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The eComJunction collaboration system enables page owners to build teams by inviting members with specific roles and permissions. This system supports the platform's evolution from solo creators to enterprise teams.

### Key Features
- **Page-Level Teams**: Each page can have its own team with unique members
- **Role-Based Permissions**: Four roles (owner, admin, editor, viewer) with granular permissions
- **Email Invitations**: Secure token-based invitation system
- **Plan-Based Limits**: Team size restrictions based on subscription tier
- **Activity Logging**: Complete audit trail of team changes
- **Automatic Initialization**: Owner auto-added when page is created

### Use Cases
- **Solo Creator** (Free): Single-user page management
- **Small Team** (Pro): 3-5 collaborators per page
- **Enterprise** (Enterprise): Unlimited team members across unlimited pages

---

## Architecture

### Two-Tier Role System

The platform uses a **two-tier role system** to separate global and page-level permissions:

#### 1. Platform Roles (Global)
Define who you are across the entire platform:
- `admin` - Platform administrator with full system access
- `affiliate_marketer` - Content creators who create and manage pages
- `end_user` - Visitors browsing public pages (no authentication required)

**Location**: `src/types/index.ts` - `UserRole` type
**Utility**: `src/utils/permissions.ts` - Platform role permissions

#### 2. Page Roles (Per-Page)
Define what you can do on a specific page:
- `owner` - Page creator with full control including deletion
- `admin` - Full page management except deletion
- `editor` - Product management only (add/edit/delete products)
- `viewer` - Read-only analytics access

**Location**: `src/types/index.ts` - `PageRole` type
**Utility**: `src/utils/pagePermissions.ts` - Page role permissions

### Why Two Tiers?

This separation provides:
- **Clean Boundaries**: Platform vs. page-level concerns
- **Scalability**: Easy to add new roles at either level
- **Flexibility**: Same user can have different roles on different pages
- **Security**: Fine-grained access control

---

## Database Schema

### Migration Files
- `migrations/003_add_pages_and_roles.sql` - Pages foundation and platform roles
- `migrations/004_add_collaboration_system.sql` - Collaboration tables and triggers

### Core Tables

#### `page_collaborators`
Stores team members and their roles for each page.

```sql
CREATE TABLE page_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}', -- For granular permission overrides
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, user_id)
);
```

**Key Points**:
- One user can only have one role per page (UNIQUE constraint)
- `is_active` allows soft-delete without losing history
- `permissions` JSONB allows custom permission overrides
- Cascading deletes when page or user is deleted
- `invited_by` tracks who added each member

#### `page_invitations`
Manages pending email invitations.

```sql
CREATE TABLE page_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted BOOLEAN DEFAULT false,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, email, accepted) -- Prevent duplicate pending invitations
);
```

**Key Points**:
- Cannot invite as `owner` (owner is page creator only)
- Unique token for secure invitation acceptance
- Invitations expire after 7 days (default)
- UNIQUE constraint prevents duplicate pending invitations
- `accepted_by` links to user who accepted (may differ from invited email if account exists)

#### `team_member_limits`
Tracks team size and limits per page.

```sql
CREATE TABLE team_member_limits (
    page_id UUID PRIMARY KEY REFERENCES pages(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 0, -- Free: 0, Pro: 3, Enterprise: -1 (unlimited)
    current_members INTEGER DEFAULT 1, -- Starts with 1 (owner)
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Points**:
- `max_members`: 0 (Free), 3 (Pro), -1 (Enterprise/unlimited)
- `current_members` includes owner (minimum 1)
- Automatically updated via triggers
- Primary key on `page_id` ensures one limit per page

#### `activity_log`
Audit trail for collaboration activities.

```sql
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Actions Logged**:
- `member_invited` - Invitation sent
- `member_added` - Invitation accepted
- `member_removed` - Member removed from team
- `role_changed` - Member role updated
- `member_activated` / `member_deactivated` - Status changes

### Database Triggers

#### Auto-Add Owner on Page Creation
```sql
CREATE OR REPLACE FUNCTION add_page_owner_as_collaborator()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO page_collaborators (page_id, user_id, role, invited_by, accepted_at)
    VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_page_owner
    AFTER INSERT ON pages
    FOR EACH ROW
    EXECUTE FUNCTION add_page_owner_as_collaborator();
```

#### Initialize Team Limits on Page Creation
```sql
CREATE OR REPLACE FUNCTION initialize_team_member_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_plan VARCHAR(20);
    max_members_allowed INTEGER;
BEGIN
    SELECT subscription_plan INTO user_plan
    FROM users WHERE id = NEW.user_id;

    max_members_allowed := CASE user_plan
        WHEN 'free' THEN 0
        WHEN 'pro' THEN 3
        WHEN 'enterprise' THEN -1
        ELSE 0
    END;

    INSERT INTO team_member_limits (page_id, max_members, current_members)
    VALUES (NEW.id, max_members_allowed, 1);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Update Team Limits on Plan Change
```sql
CREATE OR REPLACE FUNCTION update_team_limits_on_plan_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_plan != OLD.subscription_plan THEN
        UPDATE team_member_limits
        SET max_members = CASE NEW.subscription_plan
            WHEN 'free' THEN 0
            WHEN 'pro' THEN 3
            WHEN 'enterprise' THEN -1
            ELSE 0
        END,
        last_updated = NOW()
        WHERE page_id IN (
            SELECT id FROM pages WHERE user_id = NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Auto-Update Team Member Count
```sql
-- Increment on INSERT
CREATE OR REPLACE FUNCTION increment_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role != 'owner' AND NEW.is_active = true THEN
        UPDATE team_member_limits
        SET current_members = current_members + 1, last_updated = NOW()
        WHERE page_id = NEW.page_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Decrement on DELETE
CREATE OR REPLACE FUNCTION decrement_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role != 'owner' AND OLD.is_active = true THEN
        UPDATE team_member_limits
        SET current_members = GREATEST(1, current_members - 1), last_updated = NOW()
        WHERE page_id = OLD.page_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Handle status changes (activate/deactivate)
CREATE OR REPLACE FUNCTION handle_collaborator_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active != OLD.is_active AND NEW.role != 'owner' THEN
        IF NEW.is_active = true THEN
            UPDATE team_member_limits
            SET current_members = current_members + 1, last_updated = NOW()
            WHERE page_id = NEW.page_id;
        ELSE
            UPDATE team_member_limits
            SET current_members = GREATEST(1, current_members - 1), last_updated = NOW()
            WHERE page_id = NEW.page_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Activity Logging
```sql
CREATE OR REPLACE FUNCTION log_collaboration_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
        VALUES (NEW.page_id, NEW.invited_by, 'member_added', NEW.user_id,
                jsonb_build_object('role', NEW.role));
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.role != OLD.role THEN
            INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
            VALUES (NEW.page_id, NEW.invited_by, 'role_changed', NEW.user_id,
                    jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
        VALUES (OLD.page_id, OLD.invited_by, 'member_removed', OLD.user_id,
                jsonb_build_object('role', OLD.role));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## Role System

### Platform Roles

Defined in `src/utils/permissions.ts`:

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canViewAllPages: true,
    canViewAllAnalytics: true,
    canManageSystem: true,
    canCreatePages: true,
    canCreateProducts: true,
    canEditOwnPages: true,
    canEditOwnProducts: true,
    canViewOwnAnalytics: true,
    canDeleteOwnPages: true,
    canDeleteOwnProducts: true,
  },
  affiliate_marketer: {
    canManageUsers: false,
    canViewAllPages: false,
    canViewAllAnalytics: false,
    canManageSystem: false,
    canCreatePages: true,
    canCreateProducts: true,
    canEditOwnPages: true,
    canEditOwnProducts: true,
    canViewOwnAnalytics: true,
    canDeleteOwnPages: true,
    canDeleteOwnProducts: true,
  },
  end_user: {
    // All false - read-only access to public pages
    canManageUsers: false,
    canViewAllPages: false,
    canViewAllAnalytics: false,
    canManageSystem: false,
    canCreatePages: false,
    canCreateProducts: false,
    canEditOwnPages: false,
    canEditOwnProducts: false,
    canViewOwnAnalytics: false,
    canDeleteOwnPages: false,
    canDeleteOwnProducts: false,
  },
};
```

### Page Roles

Defined in `src/utils/pagePermissions.ts`:

```typescript
export const PAGE_ROLE_PERMISSIONS: Record<PageRole, PagePermissions> = {
  owner: {
    canEditPage: true,
    canDeletePage: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewAnalytics: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
  },
  admin: {
    canEditPage: true,
    canDeletePage: false, // Only owner can delete
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewAnalytics: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
  },
  editor: {
    canEditPage: false,
    canDeletePage: false,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewAnalytics: true,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
  },
  viewer: {
    canEditPage: false,
    canDeletePage: false,
    canAddProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canViewAnalytics: true, // Read-only analytics
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
  },
};
```

---

## Permission Matrix

### Complete Permission Reference

| Permission | Owner | Admin | Editor | Viewer | Description |
|------------|-------|-------|--------|--------|-------------|
| **canEditPage** | ✅ | ✅ | ❌ | ❌ | Edit page settings (title, bio, theme, etc.) |
| **canDeletePage** | ✅ | ❌ | ❌ | ❌ | Permanently delete the page |
| **canAddProducts** | ✅ | ✅ | ✅ | ❌ | Add new products to the page |
| **canEditProducts** | ✅ | ✅ | ✅ | ❌ | Modify existing products |
| **canDeleteProducts** | ✅ | ✅ | ✅ | ❌ | Remove products from the page |
| **canViewAnalytics** | ✅ | ✅ | ✅ | ✅ | View page and product analytics |
| **canInviteMembers** | ✅ | ✅ | ❌ | ❌ | Send team invitations |
| **canRemoveMembers** | ✅ | ✅ | ❌ | ❌ | Remove team members |
| **canChangeRoles** | ✅ | ✅ | ❌ | ❌ | Change team member roles |

### Role Change Rules

```typescript
// From src/utils/pagePermissions.ts
export function canChangePageRole(
  currentRole: PageRole,
  newRole: PageRole,
  changerRole: PageRole
): boolean {
  // Cannot change owner role
  if (currentRole === 'owner') return false;

  // Owner can change any role
  if (changerRole === 'owner') return true;

  // Admin can change editor and viewer roles
  if (changerRole === 'admin') {
    return newRole === 'editor' || newRole === 'viewer';
  }

  // Editors and viewers cannot change roles
  return false;
}
```

### Member Removal Rules

```typescript
// From src/utils/pagePermissions.ts
export function canRemovePageMember(
  removerRole: PageRole,
  targetRole: PageRole
): boolean {
  // Cannot remove owner
  if (targetRole === 'owner') return false;

  // Owner can remove anyone
  if (removerRole === 'owner') return true;

  // Admin can remove editors and viewers
  if (removerRole === 'admin') {
    return targetRole === 'editor' || targetRole === 'viewer';
  }

  // Editors and viewers cannot remove members
  return false;
}
```

---

## API Reference

### PageContext Methods

Located in `src/contexts/PageContext.tsx`:

#### `getCollaborators(pageId: string): PageCollaborator[]`
Retrieve all team members for a specific page.

```typescript
const collaborators = getCollaborators('page-123');
console.log(collaborators); // [{ id: '...', role: 'owner', ... }]
```

#### `getPendingInvitations(pageId: string): PageInvitation[]`
Get all pending (not yet accepted) invitations for a page.

```typescript
const pending = getPendingInvitations('page-123');
console.log(pending); // [{ email: 'user@example.com', role: 'editor', ... }]
```

#### `inviteMember(pageId: string, inviteData: InviteMemberFormData): Promise<void>`
Send an invitation to a new team member.

```typescript
await inviteMember('page-123', {
  email: 'newmember@example.com',
  role: 'editor',
  message: 'Join my team!' // Optional
});
```

**Validation**:
- Checks if user has `canInviteMembers` permission
- Prevents duplicate invitations
- Validates email format
- Ensures role is not 'owner'
- Checks team size limits

**Throws**:
- Permission denied if user cannot invite
- Team limit reached if at capacity
- Invalid email if email exists as collaborator

#### `removeMember(pageId: string, collaboratorId: string): Promise<void>`
Remove a team member from the page.

```typescript
await removeMember('page-123', 'collaborator-456');
```

**Validation**:
- Checks `canRemoveMembers` permission
- Cannot remove owner
- Admins can only remove editors/viewers

#### `updateMemberRole(pageId: string, collaboratorId: string, newRole: PageRole): Promise<void>`
Change a team member's role.

```typescript
await updateMemberRole('page-123', 'collaborator-456', 'admin');
```

**Validation**:
- Checks `canChangeRoles` permission
- Cannot change owner role
- Admins can only change editor/viewer roles

#### `acceptInvitation(token: string): Promise<void>`
Accept a pending invitation via token.

```typescript
await acceptInvitation('abc123...');
```

**Validation**:
- Token must exist and not be expired
- User must be authenticated
- Email must match invitation (future: auto-match by account)

#### `cancelInvitation(invitationId: string): Promise<void>`
Cancel a pending invitation.

```typescript
await cancelInvitation('invitation-789');
```

#### `getUserRole(pageId: string): PageRole | null`
Get the current user's role on a specific page.

```typescript
const role = getUserRole('page-123');
if (role === 'owner') {
  // Show delete page button
}
```

#### `canInviteMembers(pageId: string): boolean`
Check if current user can invite members to a page.

```typescript
if (canInviteMembers('page-123')) {
  // Show "Invite Member" button
}
```

#### `getRemainingTeamSlotsForPage(pageId: string): number`
Get number of available team slots for a page.

```typescript
const slotsRemaining = getRemainingTeamSlotsForPage('page-123');
console.log(`You can invite ${slotsRemaining} more members`);
```

Returns:
- `0` - At capacity or free plan
- `number` - Specific number of slots (Pro plan)
- `Infinity` - Unlimited (Enterprise plan)

### Permission Utilities

Located in `src/utils/pagePermissions.ts`:

#### `hasPagePermission(role: PageRole, permission: keyof PagePermissions): boolean`
Check if a role has a specific permission.

```typescript
import { hasPagePermission } from '@/utils/pagePermissions';

if (hasPagePermission('editor', 'canAddProducts')) {
  // Allow product creation
}
```

#### `getPageRolePermissions(role: PageRole): PagePermissions`
Get all permissions for a role.

```typescript
import { getPageRolePermissions } from '@/utils/pagePermissions';

const permissions = getPageRolePermissions('editor');
console.log(permissions);
// { canAddProducts: true, canEditProducts: true, ... }
```

#### `validateCollaborator(...): { valid: boolean; error?: string }`
Validate a collaborator before adding.

```typescript
import { validateCollaborator } from '@/utils/pagePermissions';

const validation = validateCollaborator(
  'user@example.com',
  'editor',
  existingCollaborators,
  'owner'
);

if (!validation.valid) {
  console.error(validation.error);
}
```

### Feature Gating Utilities

Located in `src/utils/featureGating.ts`:

#### `canAddTeamMember(plan: SubscriptionPlan, currentTeamMemberCount: number): boolean`
Check if user can add another team member based on plan.

```typescript
import { canAddTeamMember } from '@/utils/featureGating';

if (canAddTeamMember('pro', 3)) {
  // Show invite button
} else {
  // Show upgrade prompt
}
```

#### `getRemainingTeamSlots(plan: SubscriptionPlan, currentTeamMemberCount: number): number`
Get remaining team slots for a plan.

```typescript
import { getRemainingTeamSlots } from '@/utils/featureGating';

const slots = getRemainingTeamSlots('pro', 2);
console.log(`${slots} slots remaining`); // "2 slots remaining"
```

#### `getTeamFeatureMessage(plan: SubscriptionPlan): string`
Get human-readable message about team features.

```typescript
import { getTeamFeatureMessage } from '@/utils/featureGating';

const message = getTeamFeatureMessage('free');
console.log(message); // "Upgrade to Pro to add team members"
```

---

## Usage Examples

### Example 1: Invite a Team Member

```typescript
import { useContext } from 'react';
import { PageContext } from '@/contexts/PageContext';
import { toast } from 'sonner';

function InviteMemberButton({ pageId }: { pageId: string }) {
  const { inviteMember, canInviteMembers, getRemainingTeamSlotsForPage } = useContext(PageContext);

  const handleInvite = async () => {
    if (!canInviteMembers(pageId)) {
      toast.error('You do not have permission to invite members');
      return;
    }

    const slotsRemaining = getRemainingTeamSlotsForPage(pageId);
    if (slotsRemaining === 0) {
      toast.error('Team is at capacity. Upgrade to add more members.');
      return;
    }

    try {
      await inviteMember(pageId, {
        email: 'newmember@example.com',
        role: 'editor',
        message: 'Join my team to help manage products!'
      });
      toast.success('Invitation sent!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <button onClick={handleInvite}>
      Invite Member
    </button>
  );
}
```

### Example 2: Display Team Members

```typescript
import { useContext } from 'react';
import { PageContext } from '@/contexts/PageContext';
import { formatPageRole } from '@/utils/pagePermissions';

function TeamMemberList({ pageId }: { pageId: string }) {
  const { getCollaborators, getUserRole } = useContext(PageContext);

  const collaborators = getCollaborators(pageId);
  const userRole = getUserRole(pageId);

  return (
    <div>
      <h2>Team Members</h2>
      <ul>
        {collaborators.map(member => (
          <li key={member.id}>
            <span>{member.user?.name || member.user?.email}</span>
            <span>{formatPageRole(member.role)}</span>
            {userRole === 'owner' && member.role !== 'owner' && (
              <button onClick={() => handleRemove(member.id)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 3: Role-Based UI Rendering

```typescript
import { useContext } from 'react';
import { PageContext } from '@/contexts/PageContext';
import { hasPagePermission } from '@/utils/pagePermissions';

function PageSettings({ pageId }: { pageId: string }) {
  const { getUserRole } = useContext(PageContext);
  const userRole = getUserRole(pageId);

  if (!userRole) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      {hasPagePermission(userRole, 'canEditPage') && (
        <EditPageForm pageId={pageId} />
      )}

      {hasPagePermission(userRole, 'canInviteMembers') && (
        <TeamManagement pageId={pageId} />
      )}

      {hasPagePermission(userRole, 'canDeletePage') && (
        <DeletePageButton pageId={pageId} />
      )}
    </div>
  );
}
```

### Example 4: Check Permissions Before Actions

```typescript
import { useContext } from 'react';
import { PageContext } from '@/contexts/PageContext';
import { canPerformPageAction } from '@/utils/pagePermissions';

function ProductManager({ pageId, productId }: Props) {
  const { getUserRole } = useContext(PageContext);
  const userRole = getUserRole(pageId);

  const handleDelete = async () => {
    if (!canPerformPageAction(userRole, 'canDeleteProducts')) {
      toast.error('You do not have permission to delete products');
      return;
    }

    // Proceed with delete
    await deleteProduct(productId);
  };

  return (
    <div>
      {canPerformPageAction(userRole, 'canEditProducts') && (
        <button onClick={handleEdit}>Edit</button>
      )}
      {canPerformPageAction(userRole, 'canDeleteProducts') && (
        <button onClick={handleDelete}>Delete</button>
      )}
    </div>
  );
}
```

### Example 5: Accept Invitation

```typescript
import { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContext } from '@/contexts/PageContext';
import { toast } from 'sonner';

function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { acceptInvitation } = useContext(PageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      handleAccept(token);
    }
  }, [token]);

  const handleAccept = async (inviteToken: string) => {
    try {
      await acceptInvitation(inviteToken);
      toast.success('Invitation accepted! Welcome to the team.');
      navigate('/pages');
    } catch (error) {
      toast.error(error.message || 'Invalid or expired invitation');
      navigate('/login');
    }
  };

  return <div>Accepting invitation...</div>;
}
```

---

## Invitation Flow

### Complete Invitation Workflow

```
1. INVITE MEMBER
   ├─ Owner/Admin clicks "Invite Member"
   ├─ Enters email + selects role (admin/editor/viewer)
   ├─ System validates:
   │  ├─ User has canInviteMembers permission
   │  ├─ Team is not at capacity
   │  ├─ Email is not already a member
   │  └─ Role is not 'owner'
   ├─ Generate secure token (32 chars, Web Crypto API)
   ├─ Set expiration (7 days from now)
   └─ Store in page_invitations table

2. SEND EMAIL (Future: Email Service)
   ├─ Email content includes:
   │  ├─ Page name
   │  ├─ Role being assigned
   │  ├─ Inviter name
   │  └─ Invitation link: /accept-invitation/:token
   └─ Email sent via service (SendGrid, AWS SES, etc.)

3. RECIPIENT RECEIVES EMAIL
   ├─ Clicks invitation link
   └─ Redirected to: /accept-invitation/:token

4. AUTHENTICATION CHECK
   ├─ If not logged in:
   │  ├─ Redirect to /login?redirect=/accept-invitation/:token
   │  └─ After login, redirect back to accept page
   └─ If logged in:
       └─ Proceed to step 5

5. ACCEPT INVITATION
   ├─ System validates:
   │  ├─ Token exists in page_invitations
   │  ├─ Token not expired (< 7 days old)
   │  ├─ Invitation not already accepted
   │  └─ User email matches invitation email (optional)
   ├─ Create page_collaborator record:
   │  ├─ page_id from invitation
   │  ├─ user_id from logged-in user
   │  ├─ role from invitation
   │  ├─ accepted_at = NOW()
   │  └─ is_active = true
   ├─ Update invitation:
   │  ├─ accepted = true
   │  ├─ accepted_by = user_id
   │  └─ accepted_at = NOW()
   └─ Increment team_member_limits.current_members

6. POST-ACCEPTANCE
   ├─ Log activity: 'member_added'
   ├─ Show success message
   └─ Redirect to page dashboard

7. CLEANUP (Periodic Job)
   ├─ Delete expired invitations (expires_at < NOW())
   └─ Run: SELECT cleanup_expired_invitations();
```

### Invitation Security

#### Token Generation
```typescript
// From src/contexts/PageContext.tsx
const generateInvitationToken = (): string => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
```

**Security Features**:
- 32-character random token (24 bytes = 192 bits of entropy)
- Web Crypto API for cryptographically secure randomness
- Unique constraint in database prevents duplicates
- Tokens stored as plain text (not sensitive, single-use)

#### Expiration
```typescript
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
```

**Cleanup Function** (Database):
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    DELETE FROM page_invitations
    WHERE expires_at < NOW() AND accepted = false;
END;
$$ LANGUAGE plpgsql;
```

---

## Security

### Permission Enforcement

#### Frontend Validation
- All UI actions check permissions before rendering buttons/forms
- PageContext validates permissions before state changes
- Role guards prevent unauthorized route access

#### Backend Validation (Future)
- API endpoints will re-validate all permissions server-side
- Never trust client-side permission checks alone
- Database constraints enforce role rules

### Data Isolation

#### Per-Page Access Control
```typescript
// Users can only see collaborators for pages they have access to
const collaborators = getCollaborators(pageId);
// Internally filters by user's role on that page
```

#### Invitation Email Matching
```typescript
// Future: Validate email match on acceptance
if (currentUser.email !== invitation.email) {
  throw new Error('Invitation email does not match your account');
}
```

### Audit Logging

All collaboration actions are logged in `activity_log`:
- Who performed the action (`user_id`)
- What action was performed (`action`)
- Who was affected (`target_user_id`)
- When it happened (`created_at`)
- Additional context (`metadata` JSONB)

```sql
SELECT
  al.action,
  u1.name AS actor,
  u2.name AS target,
  al.metadata,
  al.created_at
FROM activity_log al
LEFT JOIN users u1 ON al.user_id = u1.id
LEFT JOIN users u2 ON al.target_user_id = u2.id
WHERE al.page_id = 'page-123'
ORDER BY al.created_at DESC;
```

### Input Validation

#### Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}
```

#### Role Validation
```typescript
const INVITABLE_ROLES: PageRole[] = ['admin', 'editor', 'viewer'];
if (!INVITABLE_ROLES.includes(role)) {
  throw new Error('Cannot invite as owner');
}
```

#### Slug Validation (Pages)
```sql
CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$')
CONSTRAINT slug_length CHECK (char_length(slug) >= 5 AND char_length(slug) <= 30)
```

---

## Best Practices

### 1. Always Check Permissions

**Bad**:
```typescript
// Assumes user has permission
await removeMember(pageId, memberId);
```

**Good**:
```typescript
const userRole = getUserRole(pageId);
if (!hasPagePermission(userRole, 'canRemoveMembers')) {
  toast.error('Permission denied');
  return;
}
await removeMember(pageId, memberId);
```

### 2. Use Permission-Based Rendering

**Bad**:
```typescript
// Shows buttons based on role name
{userRole === 'owner' && <DeleteButton />}
```

**Good**:
```typescript
// Shows buttons based on permission
{hasPagePermission(userRole, 'canDeletePage') && <DeleteButton />}
```

### 3. Validate Before API Calls

**Bad**:
```typescript
// Waits for API error
try {
  await inviteMember(pageId, data);
} catch (error) {
  toast.error(error.message);
}
```

**Good**:
```typescript
// Validates before API call
if (!canInviteMembers(pageId)) {
  toast.error('Permission denied');
  return;
}

const slots = getRemainingTeamSlotsForPage(pageId);
if (slots === 0) {
  toast.error('Team is at capacity');
  return;
}

await inviteMember(pageId, data);
```

### 4. Handle Edge Cases

**Common Edge Cases**:
- User removed while viewing page (show "Access revoked" message)
- Invitation expired (show "Invitation expired" message)
- Team limit reached during invitation (validate before sending)
- Duplicate invitation attempts (prevent with validation)
- Role changes while user is active (refresh permissions on navigation)

### 5. Use TypeScript Types

**Bad**:
```typescript
function inviteMember(pageId: string, email: string, role: string) {
  // No type safety
}
```

**Good**:
```typescript
import { PageRole, InviteMemberFormData } from '@/types';

function inviteMember(pageId: string, data: InviteMemberFormData): Promise<void> {
  // Full type safety with autocomplete
}
```

### 6. Provide User Feedback

**Good UX**:
```typescript
try {
  await inviteMember(pageId, data);
  toast.success(`Invitation sent to ${data.email}`);
} catch (error) {
  if (error.message.includes('capacity')) {
    toast.error('Team is at capacity', {
      action: {
        label: 'Upgrade',
        onClick: () => navigate('/pricing')
      }
    });
  } else {
    toast.error(error.message);
  }
}
```

### 7. Clean Up Expired Invitations

**Cron Job Example** (Backend):
```javascript
// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await db.query('SELECT cleanup_expired_invitations()');
  console.log('Expired invitations cleaned up');
});
```

---

## Troubleshooting

### Issue: "Permission denied" when inviting members

**Cause**: User doesn't have `canInviteMembers` permission.

**Solution**:
1. Check user's role: `getUserRole(pageId)`
2. Verify role has permission: `hasPagePermission(role, 'canInviteMembers')`
3. Only `owner` and `admin` can invite members
4. If user is `editor` or `viewer`, they cannot invite

### Issue: "Team is at capacity"

**Cause**: Team has reached plan limit.

**Solution**:
1. Check current team size: `getCollaborators(pageId).length`
2. Check plan limit: `getRemainingTeamSlotsForPage(pageId)`
3. Free plan: 0 team members (solo only)
4. Pro plan: 3 team members per page
5. Enterprise plan: Unlimited
6. **Action**: Upgrade plan or remove inactive members

### Issue: Invitation link not working

**Possible Causes**:
1. **Expired**: Invitations expire after 7 days
2. **Already Accepted**: Token can only be used once
3. **Invalid Token**: Token doesn't exist in database
4. **Wrong Email**: User email doesn't match invitation (if strict matching enabled)

**Debug Steps**:
```sql
-- Check invitation status
SELECT * FROM page_invitations WHERE token = 'your-token-here';

-- Check if expired
SELECT
  token,
  expires_at,
  expires_at < NOW() AS is_expired,
  accepted
FROM page_invitations
WHERE token = 'your-token-here';
```

### Issue: Owner cannot be changed or removed

**Cause**: This is by design for security.

**Explanation**:
- Owner is the page creator and cannot be removed
- Owner role cannot be changed
- Only one owner per page
- To transfer ownership (future feature): Create new page with new owner

### Issue: Team member count incorrect

**Cause**: Database triggers may not have fired correctly.

**Debug Steps**:
```sql
-- Check current count vs actual
SELECT
  tml.page_id,
  tml.current_members AS tracked_count,
  COUNT(pc.id) AS actual_count
FROM team_member_limits tml
LEFT JOIN page_collaborators pc ON tml.page_id = pc.page_id AND pc.is_active = true
WHERE tml.page_id = 'your-page-id'
GROUP BY tml.page_id, tml.current_members;
```

**Fix**:
```sql
-- Recalculate team member count
UPDATE team_member_limits
SET current_members = (
  SELECT COUNT(*)
  FROM page_collaborators
  WHERE page_id = team_member_limits.page_id AND is_active = true
),
last_updated = NOW()
WHERE page_id = 'your-page-id';
```

### Issue: Cannot invite existing collaborator

**Cause**: User is already a team member.

**Solution**:
1. Check: `getCollaborators(pageId)` to see existing members
2. If user is `is_active = false`, reactivate instead of inviting
3. If user has different role, use `updateMemberRole` instead

### Issue: Admin cannot change another admin's role

**Cause**: Admins can only change `editor` and `viewer` roles.

**Explanation**:
- Owner can change any role (except owner)
- Admin can change editor and viewer roles only
- Admin cannot change another admin's role
- This prevents lateral privilege escalation

**Check**:
```typescript
import { canChangePageRole } from '@/utils/pagePermissions';

const canChange = canChangePageRole(
  'admin', // current role of target
  'editor', // new role
  'admin' // role of user making change
);
// Returns: false (admin cannot change admin)
```

---

## Migration Guide

### Migrating Existing Pages

If you have existing pages before collaboration system:

```sql
-- 1. Add owners as collaborators (already done in migration)
INSERT INTO page_collaborators (page_id, user_id, role, invited_by, accepted_at)
SELECT p.id, p.user_id, 'owner', p.user_id, NOW()
FROM pages p
WHERE NOT EXISTS (
  SELECT 1 FROM page_collaborators pc
  WHERE pc.page_id = p.id AND pc.user_id = p.user_id AND pc.role = 'owner'
)
ON CONFLICT (page_id, user_id) DO NOTHING;

-- 2. Initialize team limits (already done in migration)
INSERT INTO team_member_limits (page_id, max_members, current_members)
SELECT p.id,
  CASE u.subscription_plan
    WHEN 'free' THEN 0
    WHEN 'pro' THEN 3
    WHEN 'enterprise' THEN -1
    ELSE 0
  END,
  1
FROM pages p
JOIN users u ON p.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM team_member_limits tml WHERE tml.page_id = p.id
)
ON CONFLICT (page_id) DO NOTHING;
```

### Upgrading User Plans

When a user upgrades their plan:

```sql
-- Trigger automatically updates all pages owned by user
UPDATE users
SET subscription_plan = 'pro'
WHERE id = 'user-id';

-- Verify limits updated
SELECT p.id, p.title, tml.max_members, tml.current_members
FROM pages p
JOIN team_member_limits tml ON p.id = tml.page_id
WHERE p.user_id = 'user-id';
```

### Handling Plan Downgrades

When a user downgrades (e.g., Pro → Free):

```typescript
// Frontend warning before downgrade
const affectedPages = pages.filter(page => {
  const teamSize = getCollaborators(page.id).length;
  return teamSize > 1; // Free plan only allows 1 (owner)
});

if (affectedPages.length > 0) {
  showWarning(`
    Downgrading will affect ${affectedPages.length} pages with team members.
    You'll need to remove team members before downgrading.
  `);
}
```

**Backend Enforcement**:
```sql
-- Check before downgrade
SELECT p.id, p.title, tml.current_members
FROM pages p
JOIN team_member_limits tml ON p.id = tml.page_id
WHERE p.user_id = 'user-id' AND tml.current_members > 1;

-- If results exist, prevent downgrade or force member removal
```

---

## Future Enhancements

### Planned Features

1. **Email Service Integration**
   - SendGrid/AWS SES for invitation emails
   - Email templates with branding
   - Invitation tracking (opened, clicked)

2. **Ownership Transfer**
   - Transfer page ownership to another user
   - Requires current owner approval
   - Original owner becomes admin after transfer

3. **Custom Permissions**
   - Override default role permissions via `permissions` JSONB field
   - Example: Editor who can also invite members
   - UI for granular permission control

4. **Bulk Invitations**
   - Invite multiple members at once (CSV upload)
   - Batch invitation management
   - Mass role changes

5. **Team Templates**
   - Pre-defined team structures (e.g., "Content Team", "Analyst Team")
   - Quick setup for common collaboration patterns

6. **Advanced Activity Logging**
   - Export activity logs as CSV
   - Real-time activity feed
   - Notifications for team changes

7. **Page-Level Settings**
   - Require approval for new members
   - Auto-accept invitations from specific domains
   - Invitation expiration customization (default 7 days)

---

## API Integration

### CollaborationService

The `CollaborationService` provides the data access layer for all collaboration features. It's built on Supabase for serverless, real-time database operations.

**Location**: `src/services/CollaborationService.ts`

#### Service Methods

**Page Operations**:
- `createPage(userId, pageData)` - Create a new page
- `getUserPages(userId)` - Get all pages where user is a collaborator
- `getPageById(pageId)` - Get a single page by ID
- `getPageBySlug(slug)` - Get a page by its URL slug
- `updatePage(pageId, pageData)` - Update page metadata
- `deletePage(pageId)` - Soft delete a page

**Collaborator Operations**:
- `getCollaborators(pageId)` - Get all team members for a page (includes user data via join)
- `getUserRole(pageId, userId)` - Get user's role on a specific page
- `addCollaborator(pageId, userId, role, invitedBy)` - Add a new team member
- `updateCollaboratorRole(collaboratorId, newRole)` - Change a member's role
- `removeCollaborator(collaboratorId)` - Remove a team member (soft delete)

**Invitation Operations**:
- `createInvitation(pageId, inviteData, invitedBy, token)` - Create a new invitation
- `getPendingInvitations(pageId)` - Get all pending invitations for a page
- `getInvitationByToken(token)` - Retrieve invitation by its unique token
- `acceptInvitation(token, userId)` - Accept an invitation and add user as collaborator
- `cancelInvitation(invitationId)` - Cancel a pending invitation

**Team Limits Operations**:
- `getTeamLimits(pageId)` - Get current team size and limits for a page

#### Usage Example

```typescript
import { collaborationService } from '@/services/CollaborationService';

// Create a new page
const page = await collaborationService.createPage(userId, {
  slug: 'my-awesome-page',
  title: 'My Awesome Page',
  description: 'Check out my favorite products!',
  isPublic: true,
});

// Invite a team member
const token = generateSecureToken();
const invitation = await collaborationService.createInvitation(
  page.id,
  {
    email: 'teammate@example.com',
    role: 'editor',
    message: 'Join my team!',
  },
  currentUserId,
  token
);

// Send invitation email
await emailService.sendTeamInvitation(
  invitation.email,
  currentUser.name,
  page.title,
  invitation.role,
  token,
  'Join my team!'
);

// Accept invitation (when user clicks link)
await collaborationService.acceptInvitation(token, newUserId);
```

### EmailService Integration

The `EmailService` has been extended to support team invitation emails.

**Location**: `src/services/EmailService.ts`

#### New Method

```typescript
sendTeamInvitation(
  inviteeEmail: string,
  inviterName: string,
  pageName: string,
  role: string,
  invitationToken: string,
  personalMessage?: string
): Promise<EmailResponse>
```

**Features**:
- Beautiful HTML email template with role-specific permissions listed
- Plain text fallback for email clients that don't support HTML
- Personal message support
- 7-day expiration warning
- CAN-SPAM compliance (unsubscribe link, physical address)
- Responsive design

**Email Content**:
- Inviter's name and page name
- Role being assigned (Admin, Editor, or Viewer)
- Role description and permissions list
- Personal message (if provided)
- Accept invitation button with fallback link
- 7-day expiration notice

### Supabase Database Types

All collaboration tables are now type-safe with auto-generated TypeScript types.

**Location**: `src/lib/supabase.ts`

#### Database Interface

The `Database` interface includes type definitions for:
- `pages` - Page metadata (slug, title, theme, etc.)
- `page_products` - Page-product junction table
- `page_collaborators` - Team member records
- `page_invitations` - Pending invitations
- `team_member_limits` - Team capacity tracking
- `activity_log` - Audit trail

Each table has three type variations:
- `Row` - Data returned from SELECT queries
- `Insert` - Data required for INSERT operations
- `Update` - Data allowed in UPDATE operations

**Example**:
```typescript
import { Database } from '@/lib/supabase';

type PageRow = Database['public']['Tables']['pages']['Row'];
type PageInsert = Database['public']['Tables']['pages']['Insert'];
type PageUpdate = Database['public']['Tables']['pages']['Update'];

// Type-safe insert
const newPage: PageInsert = {
  user_id: userId,
  slug: 'my-page',
  title: 'My Page',
  is_public: true,
  // TypeScript will enforce required fields and types
};
```

### Real-Time Features (Future)

Supabase provides real-time capabilities that can be leveraged for:
- Live team member updates (see who joins/leaves in real-time)
- Collaborative editing indicators
- Live notification of role changes
- Instant invitation acceptance updates

**Example (Future Implementation)**:
```typescript
// Subscribe to collaborator changes
const subscription = supabase
  .from('page_collaborators')
  .on('INSERT', (payload) => {
    console.log('New team member added:', payload.new);
    // Update UI with new collaborator
  })
  .on('DELETE', (payload) => {
    console.log('Team member removed:', payload.old);
    // Remove from UI
  })
  .subscribe();
```

### API Error Handling

All service methods throw errors with descriptive messages. Always wrap API calls in try-catch blocks:

```typescript
try {
  await collaborationService.createPage(userId, pageData);
  toast.success('Page created successfully!');
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### Environment Variables

Required for API integration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email Service (Optional - for sending invitations)
EMAILIT_API_KEY=your-emailit-api-key
EMAILIT_FROM_EMAIL=notifications@yourdomain.com
EMAILIT_FROM_NAME=Your App Name

# Production URL (for invitation links)
VITE_PRODUCTION_URL=https://yourdomain.com
```

---

## Appendix

### Quick Reference: Plan Limits

| Plan | Max Pages | Team Members/Page | Team Features |
|------|-----------|-------------------|---------------|
| Free | 1 | 0 (solo) | ❌ |
| Pro | 5 | 3 | ✅ |
| Enterprise | Unlimited | Unlimited | ✅ |

### Quick Reference: Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `page_collaborators` | Team members per page | `page_id`, `user_id`, `role`, `is_active` |
| `page_invitations` | Pending invitations | `email`, `role`, `token`, `expires_at`, `accepted` |
| `team_member_limits` | Team size tracking | `page_id`, `max_members`, `current_members` |
| `activity_log` | Audit trail | `page_id`, `user_id`, `action`, `target_user_id` |

### Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `migrations/004_add_collaboration_system.sql` | Database schema |
| `src/types/index.ts` | TypeScript types |
| `src/contexts/PageContext.tsx` | State management |
| `src/utils/pagePermissions.ts` | Permission utilities |
| `src/utils/featureGating.ts` | Plan limits |
| `src/components/auth/RoleGuard.tsx` | Route protection |

---

**Last Updated**: 2025-01-01
**Version**: 1.0
**Maintainer**: eComJunction Team

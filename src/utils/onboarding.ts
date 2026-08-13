export function hasPublicHandle(username?: string | null): boolean {
  return Boolean(username && username.trim());
}

export function canCompleteOnboarding(input: {
  username?: string | null;
  productCount: number;
}): boolean {
  return hasPublicHandle(input.username) && input.productCount >= 1;
}

/**
 * Whether the first-hour wizard should be forced open.
 * Demo users never see the modal. Returning users who already have a
 * handle and at least one product are never blocked — unless they are
 * mid-wizard (just added the product and still need theme/share).
 */
export function shouldShowOnboarding(input: {
  isAuthenticated: boolean;
  isDemo: boolean;
  username?: string | null;
  productCount: number;
  completed: boolean;
  dismissed: boolean;
  inProgress?: boolean;
}): boolean {
  if (!input.isAuthenticated || input.isDemo) {
    return false;
  }

  if (!hasPublicHandle(input.username)) {
    return true;
  }

  if (input.completed || input.dismissed) {
    return false;
  }

  if (canCompleteOnboarding(input) && !input.inProgress) {
    return false;
  }

  return true;
}

export function getOnboardingStartStep(input: {
  username?: string | null;
  productCount: number;
  welcomeSeen: boolean;
}): number {
  if (!hasPublicHandle(input.username)) {
    return input.welcomeSeen ? 1 : 0;
  }
  if (input.productCount < 1) {
    return 2;
  }
  return 4;
}

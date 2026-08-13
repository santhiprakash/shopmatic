import { describe, it, expect } from 'vitest';
import {
  canCompleteOnboarding,
  getOnboardingStartStep,
  hasPublicHandle,
  shouldShowOnboarding,
} from '../onboarding';

describe('canCompleteOnboarding', () => {
  it('requires a username and at least one product', () => {
    expect(canCompleteOnboarding({ username: undefined, productCount: 1 })).toBe(false);
    expect(canCompleteOnboarding({ username: '', productCount: 1 })).toBe(false);
    expect(canCompleteOnboarding({ username: 'shop', productCount: 0 })).toBe(false);
    expect(canCompleteOnboarding({ username: 'shop', productCount: 1 })).toBe(true);
  });
});

describe('shouldShowOnboarding', () => {
  const base = {
    isAuthenticated: true,
    isDemo: false,
    username: undefined as string | undefined,
    productCount: 0,
    completed: false,
    dismissed: false,
  };

  it('hides for demo and logged-out users', () => {
    expect(shouldShowOnboarding({ ...base, isAuthenticated: false })).toBe(false);
    expect(shouldShowOnboarding({ ...base, isDemo: true })).toBe(false);
  });

  it('always shows when a real user has no handle', () => {
    expect(shouldShowOnboarding({ ...base, completed: true, dismissed: true })).toBe(true);
  });

  it('does not block returning users who already have handle + product', () => {
    expect(
      shouldShowOnboarding({
        ...base,
        username: 'shop',
        productCount: 2,
        completed: false,
      })
    ).toBe(false);
  });

  it('stays open after the first product if the wizard is still in progress', () => {
    expect(
      shouldShowOnboarding({
        ...base,
        username: 'shop',
        productCount: 1,
        inProgress: true,
      })
    ).toBe(true);
  });

  it('hides after remind-me when handle exists but catalog is empty', () => {
    expect(
      shouldShowOnboarding({
        ...base,
        username: 'shop',
        productCount: 0,
        dismissed: true,
      })
    ).toBe(false);
  });

  it('shows product step when handle exists, no products, not dismissed', () => {
    expect(
      shouldShowOnboarding({
        ...base,
        username: 'shop',
        productCount: 0,
      })
    ).toBe(true);
  });
});

describe('getOnboardingStartStep', () => {
  it('starts at welcome, then handle, then product', () => {
    expect(getOnboardingStartStep({ welcomeSeen: false, productCount: 0 })).toBe(0);
    expect(getOnboardingStartStep({ welcomeSeen: true, productCount: 0 })).toBe(1);
    expect(getOnboardingStartStep({ username: 'shop', productCount: 0, welcomeSeen: true })).toBe(2);
  });
});

describe('hasPublicHandle', () => {
  it('treats blank strings as missing', () => {
    expect(hasPublicHandle('  ')).toBe(false);
    expect(hasPublicHandle('shop')).toBe(true);
  });
});

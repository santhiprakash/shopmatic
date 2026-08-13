import { useState, useEffect, useCallback } from 'react';
import { canCompleteOnboarding } from '@/utils/onboarding';

const ONBOARDING_STORAGE_KEY = 'shopmatic-onboarding';
const ONBOARDING_COMPLETED_KEY = 'shopmatic-onboarding-completed';
const ONBOARDING_REMIND_KEY = 'shopmatic-onboarding-remind';

export const ONBOARDING_STEP_COUNT = 5;

export interface OnboardingState {
  currentStep: number;
  completed: boolean;
  skipped: boolean;
  progress: {
    welcome: boolean;
    handle: boolean;
    product: boolean;
    theme: boolean;
    share: boolean;
  };
}

const defaultState: OnboardingState = {
  currentStep: 0,
  completed: false,
  skipped: false,
  progress: {
    welcome: false,
    handle: false,
    product: false,
    theme: false,
    share: false,
  },
};

function loadState(): OnboardingState {
  const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  const dismissed = localStorage.getItem(ONBOARDING_REMIND_KEY) === 'true';

  const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        progress: { ...defaultState.progress, ...parsed.progress },
        completed,
        skipped: dismissed,
      };
    } catch {
      return { ...defaultState, completed, skipped: dismissed };
    }
  }

  return { ...defaultState, completed, skipped: dismissed };
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(loadState);

  useEffect(() => {
    if (!state.completed) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, ONBOARDING_STEP_COUNT - 1),
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, ONBOARDING_STEP_COUNT - 1)),
    }));
  }, []);

  const completeStep = useCallback((stepName: keyof OnboardingState['progress']) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [stepName]: true,
      },
    }));
  }, []);

  const completeOnboarding = useCallback((username?: string | null, productCount = 0): boolean => {
    if (!canCompleteOnboarding({ username, productCount })) {
      return false;
    }
    setState(prev => ({
      ...prev,
      completed: true,
      skipped: false,
      currentStep: ONBOARDING_STEP_COUNT - 1,
    }));
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_REMIND_KEY);
    return true;
  }, []);

  /**
   * Required steps cannot skip the whole wizard.
   * Without a username this is a no-op (do not set completed).
   * With a username, dismiss to the dashboard without marking complete.
   */
  const skipOnboarding = useCallback((username?: string | null) => {
    if (!username || !username.trim()) {
      return;
    }
    setState(prev => ({
      ...prev,
      skipped: true,
      completed: false,
    }));
    localStorage.setItem(ONBOARDING_REMIND_KEY, 'true');
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_REMIND_KEY);
  }, []);

  return {
    state,
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}

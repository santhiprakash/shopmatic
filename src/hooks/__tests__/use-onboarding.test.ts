import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '../use-onboarding';

const store: Record<string, string> = {};

describe('useOnboarding', () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    const mock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    };
    Object.defineProperty(global, 'localStorage', { value: mock, writable: true });
  });

  it('does not mark onboarding complete without a username', () => {
    const { result } = renderHook(() => useOnboarding());

    let completed = true;
    act(() => {
      completed = result.current.completeOnboarding(undefined, 3);
    });

    expect(completed).toBe(false);
    expect(result.current.state.completed).toBe(false);
    expect(store['shopmatic-onboarding-completed']).toBeUndefined();
  });

  it('does not treat skip as complete when username is missing', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.skipOnboarding();
    });

    expect(result.current.state.completed).toBe(false);
    expect(result.current.state.skipped).toBe(false);
    expect(store['shopmatic-onboarding-completed']).toBeUndefined();
  });

  it('skip with a username reminds later without completing', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.skipOnboarding('shop');
    });

    expect(result.current.state.completed).toBe(false);
    expect(result.current.state.skipped).toBe(true);
    expect(store['shopmatic-onboarding-completed']).toBeUndefined();
    expect(store['shopmatic-onboarding-remind']).toBe('true');
  });

  it('completes only when username and a product exist', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      expect(result.current.completeOnboarding('shop', 0)).toBe(false);
      expect(result.current.completeOnboarding('shop', 1)).toBe(true);
    });

    expect(result.current.state.completed).toBe(true);
    expect(store['shopmatic-onboarding-completed']).toBe('true');
  });
});

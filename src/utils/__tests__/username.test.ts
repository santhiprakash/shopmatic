import { describe, it, expect } from 'vitest';
import { normalizeUsername, validateUsername, USERNAME_REGEX } from '../username';

describe('validateUsername', () => {
  it('accepts a simple handle', () => {
    expect(validateUsername('santhi').valid).toBe(true);
  });

  it('accepts hyphens in the middle', () => {
    expect(validateUsername('my-shop-1').valid).toBe(true);
  });

  it('normalizes case and whitespace', () => {
    expect(normalizeUsername('  My-Shop  ')).toBe('my-shop');
    expect(validateUsername('  My-Shop  ').valid).toBe(true);
  });

  it('rejects empty, too short, and too long', () => {
    expect(validateUsername('').valid).toBe(false);
    expect(validateUsername('ab').valid).toBe(false);
    expect(validateUsername('a'.repeat(31)).valid).toBe(false);
  });

  it('rejects leading/trailing hyphens and illegal characters', () => {
    expect(validateUsername('-abc').valid).toBe(false);
    expect(validateUsername('abc-').valid).toBe(false);
    expect(validateUsername('hello_world').valid).toBe(false);
    expect(validateUsername('hello.world').valid).toBe(false);
  });

  it('rejects reserved slugs', () => {
    expect(validateUsername('dashboard').valid).toBe(false);
    expect(validateUsername('admin').valid).toBe(false);
    expect(validateUsername('api').valid).toBe(false);
  });

  it('matches the documented slug regex', () => {
    expect(USERNAME_REGEX.test('ab')).toBe(false);
    expect(USERNAME_REGEX.test('abc')).toBe(true);
    expect(USERNAME_REGEX.test('a-b')).toBe(true);
  });
});

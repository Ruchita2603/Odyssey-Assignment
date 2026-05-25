import { describe, it, expect } from 'vitest';
import { formatCents, parseToCents, initials, getAvailableActions, ORDER_TRANSITIONS } from '../src/index';

describe('formatCents', () => {
  it('formats zero', () => expect(formatCents(0)).toBe('$0.00'));
  it('formats dollars and cents', () => expect(formatCents(2450)).toBe('$24.50'));
  it('formats large values', () => expect(formatCents(100000)).toBe('$1,000.00'));
});

describe('parseToCents', () => {
  it('parses plain number', () => expect(parseToCents('24.50')).toBe(2450));
  it('strips dollar sign', () => expect(parseToCents('$24.50')).toBe(2450));
  it('rounds correctly', () => expect(parseToCents('9.999')).toBe(1000));
});

describe('initials', () => {
  it('returns two initials for full name', () => expect(initials('Alice Martin')).toBe('AM'));
  it('returns one initial for single name', () => expect(initials('Cher')).toBe('C'));
  it('returns max two initials for long name', () => expect(initials('Jean-Paul Sartre Beauvoir')).toBe('JS'));
});

describe('getAvailableActions', () => {
  it('returns confirm and cancel for pending orders', () => {
    const actions = getAvailableActions('pending');
    const actionNames = actions.map((a) => a.action);
    expect(actionNames).toContain('confirm');
    expect(actionNames).toContain('cancel');
  });

  it('returns empty array for completed orders', () => {
    expect(getAvailableActions('completed')).toHaveLength(0);
  });

  it('returns empty array for cancelled orders', () => {
    expect(getAvailableActions('cancelled')).toHaveLength(0);
  });

  it('marks cancel as danger variant', () => {
    const actions = getAvailableActions('pending');
    const cancel = actions.find((a) => a.action === 'cancel');
    expect(cancel?.variant).toBe('danger');
  });
});

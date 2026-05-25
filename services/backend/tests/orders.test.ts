import { describe, it, expect } from 'vitest';
import { resolveStatusAction } from '../src/lib/schemas';
import { ORDER_TRANSITIONS } from '../src/db/schema';

describe('Order state machine', () => {
  describe('resolveStatusAction', () => {
    it('allows pending → confirmed via confirm action', () => {
      const result = resolveStatusAction('pending', 'confirm');
      expect(result).toEqual({ ok: true, nextStatus: 'confirmed' });
    });

    it('allows confirmed → preparing via start_preparing action', () => {
      const result = resolveStatusAction('confirmed', 'start_preparing');
      expect(result).toEqual({ ok: true, nextStatus: 'preparing' });
    });

    it('allows preparing → ready via mark_ready action', () => {
      const result = resolveStatusAction('preparing', 'mark_ready');
      expect(result).toEqual({ ok: true, nextStatus: 'ready' });
    });

    it('allows ready → completed via complete action', () => {
      const result = resolveStatusAction('ready', 'complete');
      expect(result).toEqual({ ok: true, nextStatus: 'completed' });
    });

    it('allows pending → cancelled via cancel action', () => {
      const result = resolveStatusAction('pending', 'cancel');
      expect(result).toEqual({ ok: true, nextStatus: 'cancelled' });
    });

    it('rejects skipping states: pending → ready', () => {
      const result = resolveStatusAction('pending', 'mark_ready');
      expect(result.ok).toBe(false);
    });

    it('rejects going backwards: completed → pending', () => {
      const result = resolveStatusAction('completed', 'confirm');
      expect(result.ok).toBe(false);
    });

    it('rejects any action on completed orders', () => {
      const actions = ['confirm', 'start_preparing', 'mark_ready', 'complete', 'cancel'];
      for (const action of actions) {
        const result = resolveStatusAction('completed', action);
        expect(result.ok).toBe(false);
      }
    });

    it('rejects any action on cancelled orders', () => {
      const actions = ['confirm', 'start_preparing', 'mark_ready', 'complete', 'cancel'];
      for (const action of actions) {
        const result = resolveStatusAction('cancelled', action);
        expect(result.ok).toBe(false);
      }
    });

    it('returns a descriptive error message on invalid transition', () => {
      const result = resolveStatusAction('completed', 'confirm');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('completed');
      }
    });

    it('rejects unknown action strings', () => {
      const result = resolveStatusAction('pending', 'ship_it');
      expect(result.ok).toBe(false);
    });
  });

  describe('ORDER_TRANSITIONS map completeness', () => {
    it('covers all statuses', () => {
      const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
      for (const status of statuses) {
        expect(ORDER_TRANSITIONS).toHaveProperty(status);
      }
    });

    it('terminal states have no allowed transitions', () => {
      expect(ORDER_TRANSITIONS.completed).toHaveLength(0);
      expect(ORDER_TRANSITIONS.cancelled).toHaveLength(0);
    });
  });
});

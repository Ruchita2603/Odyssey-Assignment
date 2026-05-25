// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a price stored in cents to a display string.
 * @example formatCents(2400) → "$24.00"
 */
export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Parse a display string like "$24.00" or "24.00" to cents.
 */
export function parseToCents(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  return Math.round(num * 100);
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Order status helpers ─────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_ACTION_LABELS: Record<string, string> = {
  confirm: 'Confirm Order',
  start_preparing: 'Start Preparing',
  mark_ready: 'Mark Ready',
  complete: 'Complete',
  cancel: 'Cancel Order',
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

export const ACTION_FOR_TRANSITION: Record<string, string> = {
  confirmed: 'confirm',
  preparing: 'start_preparing',
  ready: 'mark_ready',
  completed: 'complete',
  cancelled: 'cancel',
};

export function getAvailableActions(
  status: OrderStatus,
): Array<{ action: string; label: string; variant: 'primary' | 'danger' }> {
  return ORDER_TRANSITIONS[status].map((nextStatus) => ({
    action: ACTION_FOR_TRANSITION[nextStatus] ?? nextStatus,
    label: ORDER_ACTION_LABELS[ACTION_FOR_TRANSITION[nextStatus] ?? ''] ?? nextStatus,
    variant: nextStatus === 'cancelled' ? 'danger' : 'primary',
  }));
}

// ─── String utils ─────────────────────────────────────────────────────────────

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

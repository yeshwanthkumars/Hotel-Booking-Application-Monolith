export const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CASH', label: 'Cash' },
];

export const PAYMENT_STATUS_META = {
  PENDING: { label: 'Pending', color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700' },
  PAID: { label: 'Paid', color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  REFUNDED: { label: 'Refunded', color: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700' },
  FAILED: { label: 'Failed', color: '#ef4444', bg: 'bg-red-100', text: 'text-red-700' },
};

export const BOOKING_STATUS_META = {
  PENDING: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700' },
  NO_SHOW: { label: 'No Show', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function getPaymentStatusMeta(status) {
  return PAYMENT_STATUS_META[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
}

export function getBookingStatusMeta(status) {
  return BOOKING_STATUS_META[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
}

export function formatPaymentDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export const BOOKING_STATUS = [
  { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
  { value: 'CONFIRMED', label: 'Confirmed', color: '#10b981' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#ef4444' },
  { value: 'COMPLETED', label: 'Completed', color: '#3b82f6' },
  { value: 'NO_SHOW', label: 'No Show', color: '#6b7280' },
];

export const PAYMENT_STATUS = [
  { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
  { value: 'PAID', label: 'Paid', color: '#10b981' },
  { value: 'REFUNDED', label: 'Refunded', color: '#8b5cf6' },
  { value: 'FAILED', label: 'Failed', color: '#ef4444' },
];

export const SORT_OPTIONS = [
  { value: 'checkInDate:desc', label: 'Check-in (Newest)' },
  { value: 'checkInDate:asc', label: 'Check-in (Oldest)' },
  { value: 'guestName:asc', label: 'Guest Name (A-Z)' },
  { value: 'guestName:desc', label: 'Guest Name (Z-A)' },
  { value: 'totalPrice:desc', label: 'Total Price (High-Low)' },
  { value: 'totalPrice:asc', label: 'Total Price (Low-High)' },
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'updatedAt:desc', label: 'Recently Updated' },
];

export const DEFAULT_FILTER_STATE = {
  roomId: '',
  guestName: '',
  checkInFrom: '',
  checkInTo: '',
  bookingStatus: '',
  paymentStatus: '',
  sortBy: 'checkInDate',
  sortDir: 'desc',
  page: 0,
  size: 9,
};

export function getBookingStatusMeta(status) {
  return BOOKING_STATUS.find((item) => item.value === status) || null;
}

export function getPaymentStatusMeta(status) {
  return PAYMENT_STATUS.find((item) => item.value === status) || null;
}

export function getRoleFromStorage() {
  return localStorage.getItem('role') || localStorage.getItem('stayease_role') || 'USER';
}

export function getTokenFromStorage() {
  return localStorage.getItem('token') || localStorage.getItem('stayease_token') || '';
}

export function formatPrice(price, currency = 'INR', locale = 'en-IN') {
  const value = Number(price ?? 0);
  if (Number.isNaN(value)) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(0);
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
}

export function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function calculateNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 0;
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

export const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single', color: '#3b82f6' },
  { value: 'DOUBLE', label: 'Double', color: '#06b6d4' },
  { value: 'SUITE', label: 'Suite', color: '#8b5cf6' },
  { value: 'DELUXE', label: 'Deluxe', color: '#ec4899' },
  { value: 'FAMILY', label: 'Family', color: '#10b981' },
];

export const BED_TYPES = [
  { value: 'KING', label: 'King' },
  { value: 'QUEEN', label: 'Queen' },
  { value: 'TWIN', label: 'Twin' },
  { value: 'DOUBLE', label: 'Double' },
];

export const ROOM_STATUS = [
  { value: 'AVAILABLE', label: 'Available', color: '#10b981' },
  { value: 'BOOKED', label: 'Booked', color: '#ef4444' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: '#f59e0b' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service', color: '#6b7280' },
];

export const VIEW_TYPES = [
  { value: 'OCEAN', label: 'Ocean' },
  { value: 'CITY', label: 'City' },
  { value: 'GARDEN', label: 'Garden' },
  { value: 'POOL', label: 'Pool' },
  { value: 'MOUNTAIN', label: 'Mountain' },
];

export const SORT_OPTIONS = [
  { value: 'roomNumber:asc', label: 'Room Number (A-Z)' },
  { value: 'roomNumber:desc', label: 'Room Number (Z-A)' },
  { value: 'price:asc', label: 'Price (Low-High)' },
  { value: 'price:desc', label: 'Price (High-Low)' },
  { value: 'floorNumber:asc', label: 'Floor Number (Low-High)' },
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'updatedAt:desc', label: 'Recently Updated' },
];

export const DEFAULT_FILTER_STATE = {
  hotelId: '',
  roomNumber: '',
  roomType: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  isActive: '',
  sortBy: 'roomNumber',
  sortDir: 'asc',
  page: 0,
  size: 9,
};

export const IMAGE_ENDPOINT = (id) => `/api/v1/rooms/${id}/image`;

export const PLACEHOLDER_ROOM_IMAGE = '/placeholder-room.svg';

export function getRoomTypeMeta(type) {
  return ROOM_TYPES.find((roomType) => roomType.value === type) || null;
}

export function getRoomStatusMeta(status) {
  return ROOM_STATUS.find((s) => s.value === status) || null;
}

export function getBedTypeName(bedType) {
  return BED_TYPES.find((b) => b.value === bedType)?.label || bedType;
}

export function getViewTypeName(viewType) {
  return VIEW_TYPES.find((v) => v.value === viewType)?.label || viewType;
}

export function getRoleFromStorage() {
  return localStorage.getItem('role') || localStorage.getItem('stayease_role') || 'USER';
}

export function getTokenFromStorage() {
  return localStorage.getItem('token') || localStorage.getItem('stayease_token') || '';
}

export function formatPrice(price) {
  const value = Number(price ?? 0);
  if (Number.isNaN(value)) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(0);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

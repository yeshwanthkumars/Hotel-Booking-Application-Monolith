export const HOTEL_TYPES = [
  { value: 'BUDGET', label: 'Budget', color: '#6b7280' },
  { value: 'LUXURY', label: 'Luxury', color: '#d97706' },
  { value: 'BOUTIQUE', label: 'Boutique', color: '#7c3aed' },
  { value: 'RESORT', label: 'Resort', color: '#059669' },
  { value: 'BUSINESS', label: 'Business', color: '#2563eb' },
];

export const STAR_RATINGS = [1, 2, 3, 4, 5];

export const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' },
  { value: 'city:asc', label: 'City (A-Z)' },
  { value: 'city:desc', label: 'City (Z-A)' },
  { value: 'starRating:desc', label: 'Star Rating (High-Low)' },
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'updatedAt:desc', label: 'Recently Updated' },
];

export const DEFAULT_FILTER_STATE = {
  name: '',
  location: '',
  city: '',
  country: '',
  starRating: '',
  hotelType: '',
  isActive: '',
  sortBy: 'name',
  sortDir: 'asc',
  page: 0,
  size: 9,
};

export const IMAGE_ENDPOINT = (id) => `/api/v1/hotels/${id}/image`;

export const PLACEHOLDER_HOTEL_IMAGE = '/placeholder-hotel.svg';

export function getHotelTypeMeta(type) {
  return HOTEL_TYPES.find((hotelType) => hotelType.value === type) || null;
}

export function getRoleFromStorage() {
  return localStorage.getItem('role') || localStorage.getItem('stayease_role') || 'USER';
}

export function getTokenFromStorage() {
  return localStorage.getItem('token') || localStorage.getItem('stayease_token') || '';
}

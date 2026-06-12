import axiosInstance from '../api/axiosInstance';

function extractApiError(error, fallbackMessage) {
  const message = error?.response?.data?.message || fallbackMessage;
  const normalized = new Error(message);
  normalized.status = error?.response?.status;
  normalized.original = error;
  return normalized;
}

function normalizeFilters(filters = {}) {
  const cleaned = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) {
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
}

export const getAllBookings = async (
  filtersOrPage = {},
  page = 0,
  size = 10,
  sortBy = 'checkInDate',
  sortDir = 'desc'
) => {
  try {
    let filters = {};
    let resolvedPage = page;
    let resolvedSize = size;
    let resolvedSortBy = sortBy;
    let resolvedSortDir = sortDir;

    if (typeof filtersOrPage === 'number') {
      resolvedPage = filtersOrPage;
      resolvedSize = page ?? 10;
      resolvedSortBy = size ?? 'checkInDate';
      resolvedSortDir = sortBy ?? 'desc';
    } else {
      filters = filtersOrPage || {};
    }

    const params = {
      ...normalizeFilters(filters),
      page: resolvedPage,
      size: resolvedSize,
      sortBy: resolvedSortBy,
      sortDir: resolvedSortDir,
    };

    const response = await axiosInstance.get('/api/v1/bookings', { params });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to fetch bookings.');
  }
};

export const getMyBookings = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/api/v1/bookings/me', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to fetch your bookings.');
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to fetch booking ${id}.`);
  }
};

export const getBookingsByRoomId = async (roomId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/bookings/room/${roomId}`);
    return Array.isArray(response.data) ? response.data : response.data?.content || [];
  } catch (error) {
    throw extractApiError(error, `Failed to fetch bookings for room ${roomId}.`);
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/api/v1/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to create booking.');
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to update booking ${id}.`);
  }
};

export const deleteBooking = async (id) => {
  try {
    await axiosInstance.delete(`/api/v1/bookings/${id}`);
  } catch (error) {
    throw extractApiError(error, `Failed to delete booking ${id}.`);
  }
};

export const cancelBooking = async (id) => {
  try {
    const response = await axiosInstance.post(`/api/v1/bookings/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to cancel booking ${id}.`);
  }
};

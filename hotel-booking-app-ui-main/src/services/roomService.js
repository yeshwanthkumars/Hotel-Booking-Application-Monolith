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

export const getAllRooms = async (
  filtersOrPage = {},
  page = 0,
  size = 10,
  sortBy = 'roomNumber',
  sortDir = 'asc',
  hotelId = ''
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
      resolvedSortBy = size ?? 'roomNumber';
      resolvedSortDir = sortBy ?? 'asc';
      filters = { hotelId };
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

    const response = await axiosInstance.get('/api/v1/rooms', { params });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to fetch rooms.');
  }
};

export const getRoomById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to fetch room ${id}.`);
  }
};

export const getRoomsByHotelId = async (hotelId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/rooms/hotel/${hotelId}`);
    return Array.isArray(response.data) ? response.data : response.data?.content || [];
  } catch (error) {
    throw extractApiError(error, `Failed to fetch rooms for hotel ${hotelId}.`);
  }
};

export const createRoom = async (roomData) => {
  try {
    const response = await axiosInstance.post('/api/v1/rooms', roomData);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to create room.');
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to update room ${id}.`);
  }
};

export const deleteRoom = async (id) => {
  try {
    await axiosInstance.delete(`/api/v1/rooms/${id}`);
  } catch (error) {
    throw extractApiError(error, `Failed to delete room ${id}.`);
  }
};

export const uploadRoomImage = async (id, file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/api/v1/rooms/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: options.onUploadProgress,
    });

    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to upload image for room ${id}.`);
  }
};

export const deleteRoomImage = async (id) => {
  try {
    await axiosInstance.delete(`/api/v1/rooms/${id}/image`);
  } catch (error) {
    throw extractApiError(error, `Failed to delete image for room ${id}.`);
  }
};

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

/**
 * Supports both signatures:
 * 1) getAllHotels(filters, page, size, sortBy, sortDir)
 * 2) getAllHotels(page, size, sortBy, sortDir, name, location) - backward compatibility
 */
export const getAllHotels = async (
  filtersOrPage = {},
  page = 0,
  size = 10,
  sortBy = 'name',
  sortDir = 'asc',
  name = '',
  location = ''
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
      resolvedSortBy = size ?? 'name';
      resolvedSortDir = sortBy ?? 'asc';
      filters = { name, location };
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

    const response = await axiosInstance.get('/api/v1/hotels', { params });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to fetch hotels.');
  }
};

export const getHotelById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/hotels/${id}`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to fetch hotel ${id}.`);
  }
};

export const getHotelByName = async (name) => {
  try {
    const response = await axiosInstance.get(`/api/v1/hotels/name/${name}`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to fetch hotel by name ${name}.`);
  }
};

export const createHotel = async (hotelData) => {
  try {
    const response = await axiosInstance.post('/api/v1/hotels', hotelData);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Failed to create hotel.');
  }
};

export const updateHotel = async (id, hotelData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/hotels/${id}`, hotelData);
    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to update hotel ${id}.`);
  }
};

export const deleteHotel = async (id) => {
  try {
    await axiosInstance.delete(`/api/v1/hotels/${id}`);
  } catch (error) {
    throw extractApiError(error, `Failed to delete hotel ${id}.`);
  }
};

export const uploadHotelImage = async (id, file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/api/v1/hotels/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: options.onUploadProgress,
    });

    return response.data;
  } catch (error) {
    throw extractApiError(error, `Failed to upload image for hotel ${id}.`);
  }
};

export const deleteHotelImage = async (id) => {
  try {
    await axiosInstance.delete(`/api/v1/hotels/${id}/image`);
  } catch (error) {
    throw extractApiError(error, `Failed to delete image for hotel ${id}.`);
  }
};

export const searchHotelsWithAi = async (query) => {
  try {
    const response = await axiosInstance.post('/api/v1/ai/search', { query });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 400) {
      throw extractApiError(error, 'Please enter a valid query up to 500 characters.');
    }

    if (status === 401) {
      throw extractApiError(error, 'Your session has expired. Please log in again.');
    }

    if (status === 500) {
      throw extractApiError(error, 'AI search is currently unavailable. Please try again shortly.');
    }

    throw extractApiError(error, 'Failed to run AI search.');
  }
};

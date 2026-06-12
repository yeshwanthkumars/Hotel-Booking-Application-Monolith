import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_FILTER_STATE, getTokenFromStorage } from '../constants/hotelConstants';
import { getAllHotels } from '../services/hotelService';

function buildApiFilters(filters) {
  const next = {
    name: filters.name,
    location: filters.location,
    city: filters.city,
    country: filters.country,
    starRating: filters.starRating,
    hotelType: filters.hotelType,
  };

  if (filters.isActive !== '' && filters.isActive !== null && filters.isActive !== undefined) {
    next.isActive = filters.isActive;
  }

  return next;
}

export default function useHotels(initialFilters = DEFAULT_FILTER_STATE) {
  const [hotels, setHotels] = useState([]);
  const [filters, setFiltersState] = useState({ ...DEFAULT_FILTER_STATE, ...initialFilters });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      const token = getTokenFromStorage();
      if (!token) {
        if (!active) return;
        setHotels([]);
        setTotalPages(0);
        setError('Please log in to view hotels.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const data = await getAllHotels(
          buildApiFilters(filters),
          currentPage,
          filters.size || 9,
          filters.sortBy || 'name',
          filters.sortDir || 'asc'
        );

        if (!active) return;
        setHotels(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setCurrentPage(data?.page ?? currentPage);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load hotels.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentPage, filters, reloadKey]);

  const setFilters = useCallback((nextFilters) => {
    setFiltersState((prev) => ({ ...prev, ...nextFilters }));
    setCurrentPage(0);
  }, []);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const refetch = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    hotels,
    totalPages,
    currentPage,
    loading,
    error,
    filters,
    setFilters,
    goToPage,
    refetch,
  };
}

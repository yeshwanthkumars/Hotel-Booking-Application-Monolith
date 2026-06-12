import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_FILTER_STATE, getTokenFromStorage } from '../constants/roomConstants';
import { getAllRooms } from '../services/roomService';

function buildApiFilters(filters) {
  const next = {
    hotelId: filters.hotelId,
    roomNumber: filters.roomNumber,
    roomType: filters.roomType,
    status: filters.status,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };

  if (filters.isActive !== '' && filters.isActive !== null && filters.isActive !== undefined) {
    next.isActive = filters.isActive;
  }

  return next;
}

export default function useRooms(initialFilters = DEFAULT_FILTER_STATE) {
  const [rooms, setRooms] = useState([]);
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
        setRooms([]);
        setTotalPages(0);
        setError('Please log in to view rooms.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const data = await getAllRooms(
          buildApiFilters(filters),
          currentPage,
          filters.size || 9,
          filters.sortBy || 'roomNumber',
          filters.sortDir || 'asc'
        );

        if (!active) return;
        setRooms(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setCurrentPage(data?.page ?? currentPage);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load rooms.');
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
    rooms,
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

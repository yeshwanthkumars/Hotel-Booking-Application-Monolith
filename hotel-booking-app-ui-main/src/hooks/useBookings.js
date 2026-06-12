import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_FILTER_STATE, getTokenFromStorage } from '../constants/bookingConstants';
import { getAllBookings } from '../services/bookingService';

function buildApiFilters(filters) {
  return {
    roomId: filters.roomId,
    guestName: filters.guestName,
    checkInFrom: filters.checkInFrom,
    checkInTo: filters.checkInTo,
    bookingStatus: filters.bookingStatus,
    paymentStatus: filters.paymentStatus,
  };
}

export default function useBookings(initialFilters = DEFAULT_FILTER_STATE) {
  const [bookings, setBookings] = useState([]);
  const [filters, setFiltersState] = useState({ ...DEFAULT_FILTER_STATE, ...initialFilters });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      const token = getTokenFromStorage();
      if (!token) {
        if (!active) return;
        setBookings([]);
        setTotalPages(0);
        setTotalElements(0);
        setError('Please log in to view bookings.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const data = await getAllBookings(
          buildApiFilters(filters),
          currentPage,
          filters.size || 9,
          filters.sortBy || 'checkInDate',
          filters.sortDir || 'desc'
        );

        if (!active) return;
        setBookings(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setCurrentPage(data?.page ?? currentPage);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load bookings.');
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
    bookings,
    totalPages,
    totalElements,
    currentPage,
    loading,
    error,
    filters,
    setFilters,
    goToPage,
    refetch,
  };
}

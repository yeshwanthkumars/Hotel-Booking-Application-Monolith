import { useCallback, useEffect, useState } from 'react';
import { getTokenFromStorage } from '../constants/bookingConstants';
import { getMyBookings } from '../services/bookingService';

export default function useMyBookings(initialPage = 0, initialSize = 9) {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [size] = useState(initialSize);
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
        setError('Please log in to view your bookings.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');

      try {
        const data = await getMyBookings(currentPage, size);
        if (!active) return;
        setBookings(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setCurrentPage(data?.page ?? currentPage);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load your bookings.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentPage, size, reloadKey]);

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
    goToPage,
    refetch,
  };
}

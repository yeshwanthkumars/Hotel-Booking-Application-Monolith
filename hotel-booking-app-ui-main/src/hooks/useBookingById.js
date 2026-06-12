import { useCallback, useEffect, useState } from 'react';
import { getTokenFromStorage } from '../constants/bookingConstants';
import { getBookingById } from '../services/bookingService';

export default function useBookingById(bookingId) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!bookingId) {
        if (!active) return;
        setBooking(null);
        setError('Booking ID is required.');
        setLoading(false);
        return;
      }

      const token = getTokenFromStorage();
      if (!token) {
        if (!active) return;
        setBooking(null);
        setError('Please log in to view booking details.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');
      try {
        const data = await getBookingById(bookingId);
        if (!active) return;
        setBooking(data);
      } catch (err) {
        if (!active) return;
        setBooking(null);
        setError(err?.message || 'Failed to load booking details.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [bookingId, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    booking,
    loading,
    error,
    refetch,
  };
}

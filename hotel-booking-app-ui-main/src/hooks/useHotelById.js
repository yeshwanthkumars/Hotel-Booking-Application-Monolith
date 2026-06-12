import { useCallback, useEffect, useState } from 'react';
import { getTokenFromStorage } from '../constants/hotelConstants';
import { getHotelById } from '../services/hotelService';

export default function useHotelById(hotelId) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!hotelId) {
        if (!active) return;
        setHotel(null);
        setError('Hotel ID is required.');
        setLoading(false);
        return;
      }

      const token = getTokenFromStorage();
      if (!token) {
        if (!active) return;
        setHotel(null);
        setError('Please log in to view hotel details.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');
      try {
        const data = await getHotelById(hotelId);
        if (!active) return;
        setHotel(data);
      } catch (err) {
        if (!active) return;
        setHotel(null);
        setError(err?.message || 'Failed to load hotel details.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [hotelId, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    hotel,
    loading,
    error,
    refetch,
  };
}

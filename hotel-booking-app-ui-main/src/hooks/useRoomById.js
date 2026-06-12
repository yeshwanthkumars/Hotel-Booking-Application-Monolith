import { useCallback, useEffect, useState } from 'react';
import { getTokenFromStorage } from '../constants/roomConstants';
import { getRoomById } from '../services/roomService';

export default function useRoomById(roomId) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!roomId) {
        if (!active) return;
        setRoom(null);
        setError('Room ID is required.');
        setLoading(false);
        return;
      }

      const token = getTokenFromStorage();
      if (!token) {
        if (!active) return;
        setRoom(null);
        setError('Please log in to view room details.');
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      setError('');
      try {
        const data = await getRoomById(roomId);
        if (!active) return;
        setRoom(data);
      } catch (err) {
        if (!active) return;
        setRoom(null);
        setError(err?.message || 'Failed to load room details.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [roomId, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    room,
    loading,
    error,
    refetch,
  };
}

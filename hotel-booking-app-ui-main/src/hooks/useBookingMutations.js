import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/ToastProvider';
import {
  createBooking as createBookingRequest,
  updateBooking as updateBookingRequest,
  deleteBooking as deleteBookingRequest,
} from '../services/bookingService';

export default function useBookingMutations(refetch) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const withMutation = useCallback(async (fn, successMessage) => {
    setLoading(true);
    setError('');
    try {
      const result = await fn();
      if (successMessage) {
        toast.success(successMessage);
      }
      if (typeof refetch === 'function') {
        await refetch();
      }
      return result;
    } catch (err) {
      let message = err?.response?.data?.message || err?.message || 'Booking operation failed.';
      if (err?.response?.status === 409) {
        message = message || 'This room is already booked for the selected dates.';
      }
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refetch, toast]);

  const createBooking = useCallback(
    async (data) => withMutation(() => createBookingRequest(data), 'Booking created!'),
    [withMutation]
  );

  const updateBooking = useCallback(
    async (id, data) => withMutation(() => updateBookingRequest(id, data), 'Booking updated!'),
    [withMutation]
  );

  const deleteBooking = useCallback(
    async (id) => withMutation(() => deleteBookingRequest(id), 'Booking deleted!'),
    [withMutation]
  );

  return {
    createBooking,
    updateBooking,
    deleteBooking,
    loading,
    error,
  };
}

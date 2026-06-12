import { useCallback, useState } from 'react';
import { cancelBooking as cancelBookingRequest } from '../services/bookingService';

function resolveCancelError(err) {
  const status = err?.status ?? err?.response?.status;
  const message = err?.message || err?.response?.data?.message;

  if (status === 403) {
    return 'You are not allowed to cancel this booking.';
  }

  if (status === 404) {
    return 'Booking not found.';
  }

  if (status === 409) {
    return message || 'Booking cannot be cancelled.';
  }

  return message || 'Failed to cancel booking.';
}

export default function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cancelBooking = useCallback(async (bookingId) => {
    setLoading(true);
    setError('');

    try {
      return await cancelBookingRequest(bookingId);
    } catch (err) {
      const normalizedMessage = resolveCancelError(err);
      setError(normalizedMessage);
      throw new Error(normalizedMessage, { cause: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError('');
  }, []);

  return {
    cancelBooking,
    loading,
    error,
    resetError,
  };
}

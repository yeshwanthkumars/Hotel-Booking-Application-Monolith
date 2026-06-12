import axiosInstance from '../api/axiosInstance';

function extractApiError(error, fallbackMessage) {
  const message = error?.response?.data?.message || fallbackMessage;
  const normalized = new Error(message);
  normalized.status = error?.response?.status;
  normalized.original = error;
  return normalized;
}

/**
 * Process a payment for a booking.
 * POST /api/v1/payments/process
 */
export const processPayment = async ({ bookingId, paymentMethod, amount }) => {
  try {
    const response = await axiosInstance.post('/api/v1/payments/process', {
      bookingId,
      paymentMethod,
      amount,
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    let fallback = 'Payment failed. Please try again.';
    if (status === 409) fallback = 'This booking has already been paid.';
    else if (status === 400) fallback = 'Payment amount does not match booking total.';
    else if (status === 404) fallback = 'Booking not found.';
    throw extractApiError(error, fallback);
  }
};

/**
 * Refund a payment for a booking. ADMIN only.
 * POST /api/v1/payments/refund/{bookingId}
 */
export const refundPayment = async (bookingId) => {
  try {
    const response = await axiosInstance.post(`/api/v1/payments/refund/${bookingId}`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    let fallback = 'Refund failed. Please try again.';
    if (status === 404) fallback = 'Booking not found.';
    else if (status === 400) fallback = 'This booking cannot be refunded.';
    throw extractApiError(error, fallback);
  }
};

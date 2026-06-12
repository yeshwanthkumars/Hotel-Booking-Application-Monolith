import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/ToastProvider';
import { processPayment as processPaymentRequest, refundPayment as refundPaymentRequest } from '../services/paymentService';

export default function usePaymentMutations() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processPayment = useCallback(async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await processPaymentRequest(data);
      toast.success('Payment processed successfully!');
      return result;
    } catch (err) {
      const message = err?.message || 'Payment failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refundPayment = useCallback(async (bookingId) => {
    setLoading(true);
    setError('');
    try {
      const result = await refundPaymentRequest(bookingId);
      toast.success('Refund processed successfully!');
      return result;
    } catch (err) {
      const message = err?.message || 'Refund failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { processPayment, refundPayment, loading, error };
}

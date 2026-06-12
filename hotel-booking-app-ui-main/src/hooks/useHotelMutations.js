import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/ToastProvider';
import {
  createHotel as createHotelRequest,
  updateHotel as updateHotelRequest,
  deleteHotel as deleteHotelRequest,
  uploadHotelImage,
  deleteHotelImage,
} from '../services/hotelService';

export default function useHotelMutations(refetch) {
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
      const message = err?.response?.data?.message || err?.message || 'Hotel operation failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refetch, toast]);

  const createHotel = useCallback(
    async (data) => withMutation(() => createHotelRequest(data), 'Hotel created!'),
    [withMutation]
  );

  const updateHotel = useCallback(
    async (id, data) => withMutation(() => updateHotelRequest(id, data), 'Hotel updated!'),
    [withMutation]
  );

  const deleteHotel = useCallback(
    async (id) => withMutation(() => deleteHotelRequest(id), 'Hotel deleted!'),
    [withMutation]
  );

  const uploadImage = useCallback(
    async (id, file, options = {}) => withMutation(() => uploadHotelImage(id, file, options), 'Hotel image uploaded!'),
    [withMutation]
  );

  const deleteImage = useCallback(
    async (id) => withMutation(() => deleteHotelImage(id), 'Hotel image removed!'),
    [withMutation]
  );

  return {
    createHotel,
    updateHotel,
    deleteHotel,
    uploadImage,
    deleteImage,
    loading,
    error,
  };
}

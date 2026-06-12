import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/ToastProvider';
import {
  createRoom as createRoomRequest,
  updateRoom as updateRoomRequest,
  deleteRoom as deleteRoomRequest,
  uploadRoomImage,
  deleteRoomImage,
} from '../services/roomService';

export default function useRoomMutations(refetch) {
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
      const message = err?.response?.data?.message || err?.message || 'Room operation failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refetch, toast]);

  const createRoom = useCallback(
    async (data) => withMutation(() => createRoomRequest(data), 'Room created!'),
    [withMutation]
  );

  const updateRoom = useCallback(
    async (id, data) => withMutation(() => updateRoomRequest(id, data), 'Room updated!'),
    [withMutation]
  );

  const deleteRoom = useCallback(
    async (id) => withMutation(() => deleteRoomRequest(id), 'Room deleted!'),
    [withMutation]
  );

  const uploadImage = useCallback(
    async (id, file, options = {}) => withMutation(() => uploadRoomImage(id, file, options), 'Room image uploaded!'),
    [withMutation]
  );

  const deleteImage = useCallback(
    async (id) => withMutation(() => deleteRoomImage(id), 'Room image removed!'),
    [withMutation]
  );

  return {
    createRoom,
    updateRoom,
    deleteRoom,
    uploadImage,
    deleteImage,
    loading,
    error,
  };
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema } from '../../validations/roomSchemas';

export default function RoomModal({ isOpen, onClose, onSubmit, room, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: '',
      price: '',
      hotelId: '',
    },
  });

  useEffect(() => {
    if (room) {
      reset({
        roomNumber: room.roomNumber ?? '',
        price: room.price ?? '',
        hotelId: room.hotelId ?? '',
      });
    } else {
      reset({ roomNumber: '', price: '', hotelId: '' });
    }
  }, [room, reset]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{room ? 'Edit Room' : 'Create Room'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type="text"
              placeholder="e.g. 204A"
              {...register('roomNumber')}
              className={`w-full rounded-lg border px-4 py-2 ${errors.roomNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`}
            />
            <p className="mt-1 min-h-4 text-xs text-red-600">{errors.roomNumber?.message || ''}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 149.99"
              {...register('price')}
              className={`w-full rounded-lg border px-4 py-2 ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`}
            />
            <p className="mt-1 min-h-4 text-xs text-red-600">{errors.price?.message || ''}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Hotel ID</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 12"
              {...register('hotelId')}
              className={`w-full rounded-lg border px-4 py-2 ${errors.hotelId ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-indigo-600`}
            />
            <p className="mt-1 min-h-4 text-xs text-red-600">{errors.hotelId?.message || ''}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isLoading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

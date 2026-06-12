import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hotelSchema } from '../../validations/hotelSchemas';
import { useState, useEffect } from 'react';

export default function HotelModal({ isOpen, onClose, onSubmit, hotel, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(hotelSchema),
    defaultValues: hotel ? { name: hotel.name, location: hotel.location } : { name: '', location: '' },
  });

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (hotel) {
      reset({ name: hotel.name, location: hotel.location });
    } else {
      reset({ name: '', location: '' });
    }
  }, [hotel, reset]);

  const handleFormSubmit = async (data) => {
    setLocalLoading(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {hotel ? 'Edit Hotel' : 'Create New Hotel'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Hotel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Grand Hotel Paradise"
              className={`w-full px-4 py-2 border rounded-lg font-medium transition-colors ${
                errors.name
                  ? 'border-red-400 bg-red-50 focus:outline-none'
                  : 'border-gray-300 focus:outline-none focus:border-indigo-600'
              }`}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              placeholder="e.g., New York, USA"
              className={`w-full px-4 py-2 border rounded-lg font-medium transition-colors ${
                errors.location
                  ? 'border-red-400 bg-red-50 focus:outline-none'
                  : 'border-gray-300 focus:outline-none focus:border-indigo-600'
              }`}
              {...register('location')}
            />
            {errors.location && (
              <p className="text-red-600 text-xs mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {(localLoading || isLoading) && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {hotel ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

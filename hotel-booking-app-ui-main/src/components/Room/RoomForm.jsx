import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ROOM_TYPES, BED_TYPES, ROOM_STATUS, VIEW_TYPES } from '../../constants/roomConstants';
import useRoomMutations from '../../hooks/useRoomMutations';
import { getAllHotels } from '../../services/hotelService';

const schema = yup.object({
  roomNumber: yup.string().required('Room number is required').min(1, 'Minimum 1 character').max(50, 'Maximum 50 characters'),
  hotelId: yup.number().required('Hotel is required').positive('Hotel must be selected'),
  price: yup.number().required('Price is required').typeError('Price must be a number').positive('Price must be greater than 0'),
  description: yup.string().nullable().max(500, 'Maximum 500 characters'),
  roomType: yup.string().nullable().oneOf([...ROOM_TYPES.map((type) => type.value), null, '']),
  bedType: yup.string().nullable(),
  maxOccupancy: yup.number().nullable().typeError('Max occupancy must be a number').positive('Must be positive'),
  floorNumber: yup.number().nullable().typeError('Floor number must be a number').positive('Must be positive'),
  roomSizeInSqFt: yup.number().nullable().typeError('Room size must be a number').positive('Must be positive'),
  viewType: yup.string().nullable().oneOf([...VIEW_TYPES.map((v) => v.value), null, '']),
  weekendPrice: yup.number().nullable().typeError('Weekend price must be a number').test('positive-or-null', 'Must be greater than 0 if set', (value) => {
    if (value === null || value === undefined || value === '') return true;
    return Number(value) > 0;
  }),
  amenities: yup.array().of(yup.string().trim().min(1, 'Amenity cannot be empty')).nullable(),
  status: yup.string().nullable().oneOf([...ROOM_STATUS.map((s) => s.value), null, '']),
  isActive: yup.boolean().default(true),
});

function buildDefaults(room) {
  return {
    roomNumber: room?.roomNumber || '',
    hotelId: room?.hotelId || '',
    price: room?.price || '',
    description: room?.description || '',
    roomType: room?.roomType || '',
    bedType: room?.bedType || '',
    maxOccupancy: room?.maxOccupancy || '',
    floorNumber: room?.floorNumber || '',
    roomSizeInSqFt: room?.roomSizeInSqFt || '',
    viewType: room?.viewType || '',
    weekendPrice: room?.weekendPrice || '',
    amenities: room?.amenities || [],
    status: room?.status || 'AVAILABLE',
    isActive: room?.isActive !== false,
  };
}

export default function RoomForm({ room, hotelId, onClose, onSuccess }) {
  const { createRoom, updateRoom, uploadImage, loading } = useRoomMutations();
  const [pendingImage, setPendingImage] = useState(null);
  const [amenityInput, setAmenityInput] = useState('');
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);

  useEffect(() => {
    if (room) return; // editing: hotel is fixed
    let active = true;
    setHotelsLoading(true);
    getAllHotels({}, 0, 200, 'name', 'asc')
      .then((data) => { if (active) setHotels(data?.content || []); })
      .catch(() => { if (active) setHotels([]); })
      .finally(() => { if (active) setHotelsLoading(false); });
    return () => { active = false; };
  }, [room]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: buildDefaults(room),
  });

  const watchAmenities = watch('amenities');

  const addAmenity = () => {
    if (!amenityInput.trim()) return;
    const current = watchAmenities || [];
    if (!current.includes(amenityInput.trim())) {
      setValue('amenities', [...current, amenityInput.trim()]);
    }
    setAmenityInput('');
  };

  const removeAmenity = (amenity) => {
    const current = watchAmenities || [];
    setValue('amenities', current.filter((a) => a !== amenity));
  };

  const onSubmit = async (data) => {
    try {
      let savedRoom;
      if (room?.id) {
        const updateData = { ...data };
        delete updateData.id;
        await updateRoom(room.id, updateData);
        savedRoom = { id: room.id, ...data };
      } else {
        savedRoom = await createRoom(data);
      }

      if (pendingImage && savedRoom?.id) {
        await uploadImage(savedRoom.id, pendingImage);
      }

      reset();
      setPendingImage(null);
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
      console.error('Form submit error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {room ? 'Edit Room' : 'Create Room'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Number *
              </label>
              <input
                type="text"
                {...register('roomNumber')}
                placeholder="e.g., 101"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {errors.roomNumber && (
                <p className="text-xs text-red-600">{errors.roomNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hotel *
              </label>
              <select
                {...register('hotelId')}
                disabled={!!room}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select a hotel</option>
                {room && <option value={room.hotelId}>Hotel #{room.hotelId}</option>}
                {!room && hotelsLoading && <option disabled>Loading hotels…</option>}
                {!room && !hotelsLoading && hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              {errors.hotelId && (
                <p className="text-xs text-red-600">{errors.hotelId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price * (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price')}
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weekend Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('weekendPrice')}
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {errors.weekendPrice && (
                <p className="text-xs text-red-600">{errors.weekendPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Type
              </label>
              <select
                {...register('roomType')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">Select type</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bed Type
              </label>
              <select
                {...register('bedType')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">Select bed type</option>
                {BED_TYPES.map((bed) => (
                  <option key={bed.value} value={bed.value}>{bed.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Occupancy
              </label>
              <input
                type="number"
                min="0"
                {...register('maxOccupancy')}
                placeholder="Number of guests"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {errors.maxOccupancy && (
                <p className="text-xs text-red-600">{errors.maxOccupancy.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floor Number
              </label>
              <input
                type="number"
                min="0"
                {...register('floorNumber')}
                placeholder="Floor"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {errors.floorNumber && (
                <p className="text-xs text-red-600">{errors.floorNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Size (sq ft)
              </label>
              <input
                type="number"
                min="0"
                {...register('roomSizeInSqFt')}
                placeholder="0"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {errors.roomSizeInSqFt && (
                <p className="text-xs text-red-600">{errors.roomSizeInSqFt.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                View Type
              </label>
              <select
                {...register('viewType')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">Select view</option>
                {VIEW_TYPES.map((view) => (
                  <option key={view.value} value={view.value}>{view.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              >
                {ROOM_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Room description"
              rows="3"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amenities
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="Add amenity"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add
              </button>
            </div>

            {watchAmenities && watchAmenities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {watchAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="hover:text-indigo-900"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!room && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPendingImage(e.target.files?.[0] || null)}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
              />
              {pendingImage && (
                <p className="mt-2 text-xs text-gray-600">
                  Image will be uploaded after room is created.
                </p>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active
          </label>

          <div className="flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (room ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RoomForm.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  hotelId: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

RoomForm.defaultProps = {
  room: null,
  hotelId: null,
};

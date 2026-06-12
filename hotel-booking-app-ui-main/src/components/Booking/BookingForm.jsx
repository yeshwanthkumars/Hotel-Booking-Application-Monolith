import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BOOKING_STATUS, PAYMENT_STATUS, calculateNights, formatPrice } from '../../constants/bookingConstants';
import useBookingMutations from '../../hooks/useBookingMutations';
import { getAllRooms } from '../../services/roomService';

const schema = yup.object({
  guestName: yup.string().required('Guest name is required').min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters'),
  checkInDate: yup.string().required('Check-in date is required'),
  checkOutDate: yup
    .string()
    .required('Check-out date is required')
    .test('after-checkin', 'Check-out date must be after check-in date', function validateCheckOut(checkOutDate) {
      const { checkInDate } = this.parent;
      if (!checkInDate || !checkOutDate) return true;
      return new Date(checkOutDate) > new Date(checkInDate);
    }),
  roomId: yup.number().required('Room is required').typeError('Room is required').positive('Room is required'),
  guestEmail: yup.string().nullable().email('Invalid email address'),
  guestPhone: yup.string().nullable(),
  numberOfGuests: yup.number().nullable().typeError('Number of guests must be a number').min(1, 'Minimum 1 guest'),
  specialRequests: yup.string().nullable(),
  bookingStatus: yup.string().nullable(),
  paymentStatus: yup.string().nullable(),
});

function buildDefaults(booking, roomId) {
  return {
    guestName: booking?.guestName || '',
    checkInDate: booking?.checkInDate || '',
    checkOutDate: booking?.checkOutDate || '',
    roomId: booking?.roomId || roomId || '',
    guestEmail: booking?.guestEmail || '',
    guestPhone: booking?.guestPhone || '',
    numberOfGuests: booking?.numberOfGuests || 1,
    specialRequests: booking?.specialRequests || '',
    bookingStatus: booking?.bookingStatus || 'PENDING',
    paymentStatus: booking?.paymentStatus || 'PENDING',
  };
}

export default function BookingForm({ booking, roomId, inline, showInlineSuccess, onClose, onSuccess }) {
  const isEditMode = Boolean(booking?.id);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [createdConfirmation, setCreatedConfirmation] = useState('');
  const { createBooking, updateBooking, loading } = useBookingMutations();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: buildDefaults(booking, roomId),
  });

  useEffect(() => {
    let active = true;
    setRoomsLoading(true);
    getAllRooms({}, 0, 200, 'roomNumber', 'asc')
      .then((data) => {
        if (!active) return;
        setRooms(data?.content || []);
      })
      .catch(() => {
        if (!active) return;
        setRooms([]);
      })
      .finally(() => {
        if (active) setRoomsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedRoomId = Number(watch('roomId'));
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');
  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId), [rooms, selectedRoomId]);
  const nights = calculateNights(checkInDate, checkOutDate);
  const estimatedTotal = (selectedRoom?.price || 0) * nights;

  const onSubmit = async (data) => {
    setLocalError('');
    setCreatedConfirmation('');

    if (new Date(data.checkOutDate) <= new Date(data.checkInDate)) {
      setLocalError('Check-out date must be after check-in date.');
      return;
    }

    const payload = {
      guestName: data.guestName,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      roomId: Number(data.roomId),
      guestEmail: data.guestEmail || undefined,
      guestPhone: data.guestPhone || undefined,
      numberOfGuests: data.numberOfGuests ? Number(data.numberOfGuests) : undefined,
      specialRequests: data.specialRequests || undefined,
    };

    if (isEditMode) {
      payload.bookingStatus = data.bookingStatus;
      payload.paymentStatus = data.paymentStatus;
      payload.roomId = booking.roomId;
    }

    try {
      const result = isEditMode
        ? await updateBooking(booking.id, payload)
        : await createBooking(payload);

      if (!isEditMode && showInlineSuccess) {
        setCreatedConfirmation(result?.confirmationNumber || '');
      }
      onSuccess?.(result);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 409) {
        const label = selectedRoom?.roomNumber ? `Room ${selectedRoom.roomNumber}` : 'Selected room';
        setLocalError(`${label} is already booked for these dates.`);
      } else {
        setLocalError(message || 'Failed to save booking.');
      }
    }
  };

  const containerClass = inline
    ? 'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'
    : 'w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl';

  const content = (
    <div className={containerClass}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Booking' : 'Create Booking'}</h2>
        {!inline && (
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Guest Name *</span>
            <input {...register('guestName')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
            {errors.guestName && <p className="text-xs text-red-600">{errors.guestName.message}</p>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Room *</span>
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isEditMode || roomsLoading || Boolean(roomId)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none disabled:bg-gray-100"
                >
                  <option value="">Select room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {formatPrice(room.price)}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.roomId && <p className="text-xs text-red-600">{errors.roomId.message}</p>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Check-in Date *</span>
            <input type="date" {...register('checkInDate')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
            {errors.checkInDate && <p className="text-xs text-red-600">{errors.checkInDate.message}</p>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Check-out Date *</span>
            <input type="date" {...register('checkOutDate')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
            {errors.checkOutDate && <p className="text-xs text-red-600">{errors.checkOutDate.message}</p>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Guest Email</span>
            <input type="email" {...register('guestEmail')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
            {errors.guestEmail && <p className="text-xs text-red-600">{errors.guestEmail.message}</p>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Guest Phone</span>
            <input {...register('guestPhone')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Number of Guests</span>
            <input type="number" min="1" {...register('numberOfGuests')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
            {errors.numberOfGuests && <p className="text-xs text-red-600">{errors.numberOfGuests.message}</p>}
          </label>

          {isEditMode && (
            <>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Booking Status</span>
                <select {...register('bookingStatus')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  {BOOKING_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Payment Status</span>
                <select {...register('paymentStatus')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  {PAYMENT_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>

        <label className="space-y-2 text-sm block">
          <span className="font-medium text-gray-700">Special Requests</span>
          <textarea rows="3" {...register('specialRequests')} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none" />
        </label>

        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          Estimated Total: <span className="font-semibold">{formatPrice(estimatedTotal)}</span>
          <span className="ml-2 text-xs text-slate-500">({nights} night{nights === 1 ? '' : 's'})</span>
        </div>

        {localError && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{localError}</p>}

        {createdConfirmation && (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Booking created. Confirmation: <span className="font-mono font-semibold">{createdConfirmation}</span>
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {!inline && (
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {content}
    </div>
  );
}

BookingForm.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.number,
    roomId: PropTypes.number,
  }),
  roomId: PropTypes.number,
  inline: PropTypes.bool,
  showInlineSuccess: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

BookingForm.defaultProps = {
  booking: null,
  roomId: undefined,
  inline: false,
  showInlineSuccess: true,
  onClose: undefined,
  onSuccess: undefined,
};

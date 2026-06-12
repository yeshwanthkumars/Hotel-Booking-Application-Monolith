import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  getBookingStatusMeta,
  getPaymentStatusMeta,
  getRoleFromStorage,
  getTokenFromStorage,
} from '../../constants/bookingConstants';
import useBookingById from '../../hooks/useBookingById';
import useBookingMutations from '../../hooks/useBookingMutations';
import useCancelBooking from '../../hooks/useCancelBooking';
import { RefundButton } from '../Payment';
import CancelBookingModal from './CancelBookingModal';
import CancellationSuccessAlert from './CancellationSuccessAlert';
import { useState } from 'react';

export default function BookingDetail({ bookingId }) {
  const navigate = useNavigate();
  const token = getTokenFromStorage();
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const { booking, loading, error, refetch } = useBookingById(bookingId);
  const { deleteBooking, loading: deleting } = useBookingMutations();
  const { cancelBooking, loading: cancelling } = useCancelBooking();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelResult, setCancelResult] = useState(null);

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">Please sign in to view booking details.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="skeleton h-[420px] rounded-2xl border border-gray-100" />;
  }

  if (error || !booking) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error || 'Booking not found.'}</p>
        <button type="button" onClick={refetch} className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Retry</button>
      </div>
    );
  }

  const bookingMeta = getBookingStatusMeta(booking.bookingStatus);
  const paymentMeta = getPaymentStatusMeta(booking.paymentStatus);
  const canCancelBooking = ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus);

  const handleConfirmCancellation = async () => {
    try {
      const result = await cancelBooking(booking.id);
      setCancelResult(result);
      setCancelError('');
      setShowCancelModal(false);
      await refetch();
    } catch (err) {
      setCancelError(err?.message || 'Failed to cancel booking.');
      setShowCancelModal(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">← Back</button>
        {canCancelBooking && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Cancel Booking
          </button>
        )}
        {isAdmin && (
          <>
            <button type="button" onClick={() => navigate(`/bookings/${booking.id}/edit`)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Edit Booking</button>
            {booking.paymentStatus === 'PAID' && (
              <RefundButton
                bookingId={booking.id}
                confirmationNumber={booking.confirmationNumber}
                onRefund={refetch}
              />
            )}
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!window.confirm(`Delete booking ${booking.confirmationNumber || booking.id}?`)) return;
                await deleteBooking(booking.id);
                navigate('/bookings');
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete Booking
            </button>
          </>
        )}
      </div>

      {cancelError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{cancelError}</p>
        </div>
      )}

      {cancelResult && <CancellationSuccessAlert result={cancelResult} />}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Confirmation Number</p>
        <p className="mt-1 font-mono text-2xl font-bold text-gray-900">{booking.confirmationNumber}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {bookingMeta && <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: bookingMeta.color }}>{bookingMeta.label}</span>}
          {paymentMeta && <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: paymentMeta.color }}>{paymentMeta.label}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><dt className="text-sm font-medium text-gray-500">Guest Name</dt><dd className="text-sm text-gray-900">{booking.guestName}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Guest Email</dt><dd className="text-sm text-gray-900">{booking.guestEmail || 'N/A'}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Guest Phone</dt><dd className="text-sm text-gray-900">{booking.guestPhone || 'N/A'}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Number of Guests</dt><dd className="text-sm text-gray-900">{booking.numberOfGuests || 'N/A'}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Check-in Date</dt><dd className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Check-out Date</dt><dd className="text-sm text-gray-900">{formatDate(booking.checkOutDate)}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Total Price</dt><dd className="text-sm text-gray-900">{formatPrice(booking.totalPrice)}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Room</dt><dd className="text-sm text-gray-900">Room {booking.roomNumber} (ID {booking.roomId}){booking.roomType ? ` - ${booking.roomType}` : ''}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Hotel</dt><dd className="text-sm text-gray-900">{booking.hotelName || 'N/A'}{booking.hotelId ? ` (ID ${booking.hotelId})` : ''}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">User ID</dt><dd className="text-sm text-gray-900">{booking.userId}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Created At</dt><dd className="text-sm text-gray-900">{formatDateTime(booking.createdAt)}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Updated At</dt><dd className="text-sm text-gray-900">{formatDateTime(booking.updatedAt)}</dd></div>
        </dl>
        {booking.specialRequests && (
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><span className="font-medium">Special Requests:</span> {booking.specialRequests}</p>
        )}
      </div>

      <CancelBookingModal
        isOpen={showCancelModal}
        booking={booking}
        isLoading={cancelling}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancellation}
      />
    </section>
  );
}

BookingDetail.propTypes = {
  bookingId: PropTypes.number.isRequired,
};

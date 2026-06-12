import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import {
  calculateNights,
  formatDate,
  formatDateTime,
  formatPrice,
  getBookingStatusMeta,
  getPaymentStatusMeta,
  getRoleFromStorage,
} from '../../constants/bookingConstants';

export default function BookingCard({ booking, onEdit, onDelete, onViewDetail, customAction }) {
  const navigate = useNavigate();
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const bookingMeta = getBookingStatusMeta(booking.bookingStatus);
  const paymentMeta = getPaymentStatusMeta(booking.paymentStatus);
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Booking Ref</p>
          <p className="font-mono text-lg font-bold text-gray-900">{booking.confirmationNumber || `BK-${booking.id}`}</p>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(booking.confirmationNumber || `BK-${booking.id}`)}
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
        >
          Copy
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <p><span className="font-medium text-gray-700">Guest:</span> {booking.guestName}</p>
        <p><span className="font-medium text-gray-700">Email:</span> {booking.guestEmail || 'N/A'}</p>
        <p><span className="font-medium text-gray-700">Phone:</span> {booking.guestPhone || 'N/A'}</p>
        <p><span className="font-medium text-gray-700">Guests:</span> {booking.numberOfGuests || 'N/A'}</p>
        <p><span className="font-medium text-gray-700">Stay:</span> {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}</p>
        <p><span className="font-medium text-gray-700">Nights:</span> {nights}</p>
        <p><span className="font-medium text-gray-700">Total:</span> {formatPrice(booking.totalPrice)}</p>
        <p>
          <span className="font-medium text-gray-700">Room:</span>{' '}
          {booking.roomId ? (
            <Link to={`/rooms/${booking.roomId}`} className="text-indigo-700 hover:underline">
              {booking.roomNumber || booking.roomId}
            </Link>
          ) : (
            booking.roomNumber || booking.roomId || 'N/A'
          )}
          {booking.roomType ? ` (${booking.roomType})` : ''}
          {' '}|{' '}
          <span className="font-medium text-gray-700">Hotel:</span>{' '}
          {booking.hotelId ? (
            <Link to={`/hotels/${booking.hotelId}`} className="text-indigo-700 hover:underline">
              {booking.hotelName || `#${booking.hotelId}`}
            </Link>
          ) : (booking.hotelName || 'N/A')}
        </p>
      </div>

      {booking.specialRequests && (
        <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <span className="font-medium">Special Requests:</span> {booking.specialRequests}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {bookingMeta && (
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: bookingMeta.color }}>
            {bookingMeta.label}
          </span>
        )}
        {paymentMeta && (
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: paymentMeta.color }}>
            {paymentMeta.label}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500">Created: {formatDateTime(booking.createdAt)}</span>
      </div>

      {(onViewDetail || isAdmin || customAction || booking.paymentStatus === 'PENDING') && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
          {booking.paymentStatus === 'PENDING' && !isAdmin && (
            <button
              type="button"
                onClick={() => navigate(`/payment/${booking.id}`, { state: { booking } })}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Pay Now
            </button>
          )}
          {onViewDetail && (
            <button
              type="button"
              onClick={() => onViewDetail(booking)}
              className="flex-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
            >
              View Details
            </button>
          )}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(booking)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(booking)}
                className="flex-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Delete
              </button>
            </>
          )}
          {customAction}
        </div>
      )}
    </article>
  );
}

BookingCard.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.number.isRequired,
    confirmationNumber: PropTypes.string,
    guestName: PropTypes.string.isRequired,
    guestEmail: PropTypes.string,
    guestPhone: PropTypes.string,
    numberOfGuests: PropTypes.number,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    totalPrice: PropTypes.number,
    bookingStatus: PropTypes.string,
    paymentStatus: PropTypes.string,
    specialRequests: PropTypes.string,
    roomId: PropTypes.number,
    roomNumber: PropTypes.string,
    roomType: PropTypes.string,
    hotelId: PropTypes.number,
    hotelName: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetail: PropTypes.func,
  customAction: PropTypes.node,
};

BookingCard.defaultProps = {
  onEdit: undefined,
  onDelete: undefined,
  onViewDetail: undefined,
  customAction: undefined,
};

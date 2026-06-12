import { useState } from 'react';
import PropTypes from 'prop-types';
import { PAYMENT_METHODS } from '../../constants/paymentConstants';
import { formatPrice } from '../../constants/bookingConstants';
import { calculateNights, formatDate } from '../../constants/bookingConstants';
import usePaymentMutations from '../../hooks/usePaymentMutations';

export default function PaymentForm({ booking, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const { processPayment, loading, error } = usePaymentMutations();

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await processPayment({
        bookingId: booking.id,
        paymentMethod,
        amount: booking.totalPrice,
      });
      onSuccess(result);
    } catch {
      // error is surfaced by the hook via toast + local error state
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Booking Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Hotel</dt>
            <dd className="font-medium text-gray-900">{booking.hotelName || `Hotel #${booking.hotelId}`}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Room</dt>
            <dd className="font-medium text-gray-900">
              Room {booking.roomNumber}
              {booking.roomType ? ` (${booking.roomType})` : ''}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Guest</dt>
            <dd className="font-medium text-gray-900">{booking.guestName}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Check-in</dt>
            <dd className="font-medium text-gray-900">{formatDate(booking.checkInDate)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Check-out</dt>
            <dd className="font-medium text-gray-900">{formatDate(booking.checkOutDate)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Nights</dt>
            <dd className="font-medium text-gray-900">{nights}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <dt className="font-semibold text-gray-700">Total Amount</dt>
            <dd className="text-xl font-bold text-indigo-600">{formatPrice(booking.totalPrice)}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <p className="font-medium">Confirmation #</p>
          <p className="font-mono mt-0.5 text-slate-800">{booking.confirmationNumber || `BK-${booking.id}`}</p>
        </div>
      </div>

      {/* Payment Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        <p className="mt-1 text-sm text-gray-500">Select a payment method and complete your booking.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-gray-700">Payment Method *</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-600 focus:outline-none"
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-gray-700">Amount (read-only)</span>
            <input
              type="text"
              readOnly
              value={formatPrice(booking.totalPrice)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-gray-700 focus:outline-none cursor-not-allowed"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          This is a mock payment — no real card details are stored.
        </p>
      </div>
    </div>
  );
}

PaymentForm.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.number.isRequired,
    confirmationNumber: PropTypes.string,
    guestName: PropTypes.string,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    totalPrice: PropTypes.number.isRequired,
    roomNumber: PropTypes.string,
    roomType: PropTypes.string,
    hotelId: PropTypes.number,
    hotelName: PropTypes.string,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
};

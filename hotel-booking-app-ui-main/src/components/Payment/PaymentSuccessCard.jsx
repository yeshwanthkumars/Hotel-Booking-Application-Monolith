import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getPaymentStatusMeta, getBookingStatusMeta, formatPaymentDateTime } from '../../constants/paymentConstants';
import { formatPrice } from '../../constants/bookingConstants';

export default function PaymentSuccessCard({ payment }) {
  const navigate = useNavigate();
  const paymentMeta = getPaymentStatusMeta(payment.paymentStatus);
  const bookingMeta = getBookingStatusMeta(payment.bookingStatus);

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
        {/* Success icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="mt-1 text-sm text-gray-500">Your booking has been confirmed. Details are below.</p>

        <dl className="mt-6 space-y-4 text-left">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-sm text-gray-500">Transaction ID</dt>
            <dd className="font-mono text-sm font-semibold text-gray-900">{payment.transactionId}</dd>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-sm text-gray-500">Confirmation #</dt>
            <dd className="font-mono text-sm font-semibold text-gray-900">{payment.confirmationNumber}</dd>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-sm text-gray-500">Amount Paid</dt>
            <dd className="text-sm font-bold text-indigo-600">{formatPrice(payment.amount)}</dd>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-sm text-gray-500">Payment Status</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentMeta.bg} ${paymentMeta.text}`}>
                {paymentMeta.label}
              </span>
            </dd>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-sm text-gray-500">Booking Status</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${bookingMeta.bg} ${bookingMeta.text}`}>
                {bookingMeta.label}
              </span>
            </dd>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-sm text-gray-500">Processed At</dt>
            <dd className="text-sm text-gray-700">{formatPaymentDateTime(payment.processedAt)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => navigate('/bookings/me')}
          className="mt-8 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
}

PaymentSuccessCard.propTypes = {
  payment: PropTypes.shape({
    transactionId: PropTypes.string,
    bookingId: PropTypes.number,
    confirmationNumber: PropTypes.string,
    paymentMethod: PropTypes.string,
    amount: PropTypes.number,
    paymentStatus: PropTypes.string,
    bookingStatus: PropTypes.string,
    processedAt: PropTypes.string,
  }).isRequired,
};

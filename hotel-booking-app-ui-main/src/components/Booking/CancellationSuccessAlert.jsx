import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function CancellationSuccessAlert({ result, showBackButton }) {
  if (!result) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-800">{result.message}</p>

      {result.refunded && (
        <p className="mt-1 text-sm text-emerald-700">💳 Refund has been initiated for your payment.</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          {result.bookingStatus || 'CANCELLED'}
        </span>
        <span className="rounded-full bg-gray-600 px-3 py-1 text-xs font-semibold text-white">
          {result.paymentStatus || 'PENDING'}
        </span>
      </div>

      {showBackButton && (
        <Link
          to="/my-bookings"
          className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Back to My Bookings
        </Link>
      )}
    </div>
  );
}

CancellationSuccessAlert.propTypes = {
  result: PropTypes.shape({
    message: PropTypes.string,
    bookingStatus: PropTypes.string,
    paymentStatus: PropTypes.string,
    refunded: PropTypes.bool,
  }),
  showBackButton: PropTypes.bool,
};

CancellationSuccessAlert.defaultProps = {
  result: null,
  showBackButton: true,
};

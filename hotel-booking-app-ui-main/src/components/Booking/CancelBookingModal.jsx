import PropTypes from 'prop-types';

export default function CancelBookingModal({ isOpen, booking, isLoading, onClose, onConfirm }) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to cancel booking{' '}
          <span className="font-mono font-semibold text-gray-900">
            {booking.confirmationNumber || `BK-${booking.id}`}
          </span>
          ? This action cannot be undone.
        </p>

        {booking.paymentStatus === 'PAID' && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            A refund will be automatically issued.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={() => onConfirm(booking.id)}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cancelling...
              </span>
            ) : (
              'Yes, Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

CancelBookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  booking: PropTypes.shape({
    id: PropTypes.number.isRequired,
    confirmationNumber: PropTypes.string,
    paymentStatus: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

CancelBookingModal.defaultProps = {
  booking: null,
  isLoading: false,
};

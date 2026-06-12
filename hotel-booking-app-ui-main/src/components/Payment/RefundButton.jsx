import { useState } from 'react';
import PropTypes from 'prop-types';
import usePaymentMutations from '../../hooks/usePaymentMutations';

export default function RefundButton({ bookingId, confirmationNumber, onRefund }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { refundPayment, loading } = usePaymentMutations();

  const handleRefund = async () => {
    try {
      const result = await refundPayment(bookingId);
      setShowConfirm(false);
      if (typeof onRefund === 'function') {
        onRefund(result);
      }
    } catch {
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Refund
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">Confirm Refund</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to refund booking{' '}
              <span className="font-mono font-semibold text-gray-900">
                {confirmationNumber || `#${bookingId}`}
              </span>
              ? This will cancel the booking and cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefund}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Refunding...
                  </span>
                ) : (
                  'Yes, Refund'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

RefundButton.propTypes = {
  bookingId: PropTypes.number.isRequired,
  confirmationNumber: PropTypes.string,
  onRefund: PropTypes.func,
};

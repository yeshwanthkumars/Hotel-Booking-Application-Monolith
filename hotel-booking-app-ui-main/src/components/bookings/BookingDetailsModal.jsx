export default function BookingDetailsModal({ isOpen, booking, onClose, onCancel, cancelLoading = false, showCancel = false }) {
  if (!isOpen || !booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Booking ID</p>
            <p className="mt-1 text-lg font-bold text-slate-900">#{booking.id}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Guest Name</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.guestName}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Room ID</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.roomId}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Check-In</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.checkInDate}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Check-Out</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.checkOutDate}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

          {showCancel && (
            <button
              type="button"
              onClick={() => onCancel?.(booking.id)}
              disabled={cancelLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

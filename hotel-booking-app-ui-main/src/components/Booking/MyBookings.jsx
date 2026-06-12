import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useMyBookings from '../../hooks/useMyBookings';
import { getTokenFromStorage } from '../../constants/bookingConstants';
import BookingCard from './BookingCard';
import useCancelBooking from '../../hooks/useCancelBooking';
import CancelBookingModal from './CancelBookingModal';
import CancellationSuccessAlert from './CancellationSuccessAlert';

function SkeletonCard() {
  return <div className="skeleton h-[340px] rounded-2xl border border-gray-100 bg-white" />;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <p className="text-5xl">📅</p>
      <h3 className="mt-3 text-xl font-semibold text-gray-900">No bookings yet</h3>
      <p className="mt-1 text-sm text-gray-500">Browse rooms to make your first reservation.</p>
      <Link to="/rooms" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Browse Rooms
      </Link>
    </div>
  );
}

export default function MyBookings() {
  const token = getTokenFromStorage();
  const {
    bookings,
    totalPages,
    totalElements,
    currentPage,
    loading,
    error,
    goToPage,
    refetch,
  } = useMyBookings(0, 9);
  const { cancelBooking, loading: cancelling, resetError } = useCancelBooking();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelResultById, setCancelResultById] = useState({});
  const [cancelErrorById, setCancelErrorById] = useState({});

  const handleOpenCancelModal = (booking) => {
    resetError();
    setSelectedBooking(booking);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBooking) return;

    try {
      const result = await cancelBooking(selectedBooking.id);
      setCancelResultById((prev) => ({
        ...prev,
        [selectedBooking.id]: result,
      }));
      setCancelErrorById((prev) => ({
        ...prev,
        [selectedBooking.id]: '',
      }));
      setSelectedBooking(null);
      await refetch();
    } catch (err) {
      setCancelErrorById((prev) => ({
        ...prev,
        [selectedBooking.id]: err?.message || 'Failed to cancel booking.',
      }));
      setSelectedBooking(null);
    }
  };

  const pages = useMemo(() => Array.from({ length: totalPages || 0 }, (_, index) => index), [totalPages]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">Please sign in to view your bookings.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">My Booking History</h2>
        <p className="text-sm text-gray-600">Total: {totalElements}</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={refetch} className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`my-booking-skeleton-${index}`} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {bookings.map((booking) => (
            <div key={booking.id} className="space-y-3">
              <BookingCard
                booking={booking}
                customAction={
                  ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus) ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(booking)}
                      className="flex-1 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-200"
                    >
                      Cancel Booking
                    </button>
                  ) : undefined
                }
              />

              {cancelResultById[booking.id] && (
                <CancellationSuccessAlert
                  result={cancelResultById[booking.id]}
                  showBackButton={false}
                />
              )}

              {cancelErrorById[booking.id] && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{cancelErrorById[booking.id]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CancelBookingModal
        isOpen={Boolean(selectedBooking)}
        booking={selectedBooking}
        isLoading={cancelling}
        onClose={() => setSelectedBooking(null)}
        onConfirm={handleConfirmCancellation}
      />

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => goToPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50">Prev</button>
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`rounded-lg px-3 py-1 text-sm ${page === currentPage ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700'}`}
            >
              {page + 1}
            </button>
          ))}
          <button type="button" onClick={() => goToPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1} className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50">Next</button>
        </div>
      )}
    </section>
  );
}

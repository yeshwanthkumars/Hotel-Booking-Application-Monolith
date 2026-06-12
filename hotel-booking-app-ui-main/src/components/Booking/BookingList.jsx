import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookings from '../../hooks/useBookings';
import useBookingMutations from '../../hooks/useBookingMutations';
import { DEFAULT_FILTER_STATE } from '../../constants/bookingConstants';
import BookingCard from './BookingCard';
import BookingFilterBar from './BookingFilterBar';
import BookingForm from './BookingForm';

function SkeletonCard() {
  return <div className="skeleton h-[360px] rounded-2xl border border-gray-100 bg-white" />;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <p className="text-5xl">🧾</p>
      <h3 className="mt-3 text-xl font-semibold text-gray-900">No bookings found</h3>
      <p className="mt-1 text-sm text-gray-500">Try adjusting your filters and search values.</p>
    </div>
  );
}

export default function BookingList() {
  const navigate = useNavigate();
  const [activeBooking, setActiveBooking] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    bookings,
    totalPages,
    totalElements,
    currentPage,
    loading,
    error,
    filters,
    setFilters,
    goToPage,
    refetch,
  } = useBookings(DEFAULT_FILTER_STATE);

  const { deleteBooking, loading: deleting } = useBookingMutations(refetch);

  const handleFiltersChange = useCallback((next) => {
    setFilters(next); // setFilters already resets currentPage to 0 internally
  }, [setFilters]);

  const pages = useMemo(() => Array.from({ length: totalPages || 0 }, (_, index) => index), [totalPages]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Booking Directory</h2>
        <button
          type="button"
          onClick={() => {
            setActiveBooking(null);
            setIsFormOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create Booking
        </button>
      </div>

      <BookingFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <p className="text-sm text-gray-600">Total bookings: {totalElements}</p>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={refetch} className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`booking-skeleton-${index}`} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetail={() => navigate(`/bookings/${booking.id}`)}
              onEdit={() => navigate(`/bookings/${booking.id}/edit`)}
              onDelete={async () => {
                if (deleting) return;
                if (!window.confirm(`Delete booking ${booking.confirmationNumber || booking.id}?`)) return;
                await deleteBooking(booking.id);
              }}
            />
          ))}
        </div>
      )}

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

      {isFormOpen && (
        <BookingForm
          booking={activeBooking}
          onClose={() => {
            setIsFormOpen(false);
            setActiveBooking(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setActiveBooking(null);
            refetch();
          }}
        />
      )}
    </section>
  );
}

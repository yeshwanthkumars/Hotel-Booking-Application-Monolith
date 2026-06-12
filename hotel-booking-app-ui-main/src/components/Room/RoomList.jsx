import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useRooms from '../../hooks/useRooms';
import useRoomMutations from '../../hooks/useRoomMutations';
import {
  DEFAULT_FILTER_STATE,
  getRoleFromStorage,
  getTokenFromStorage,
} from '../../constants/roomConstants';
import RoomFilterBar from './RoomFilterBar';
import RoomCard from './RoomCard';
import RoomForm from './RoomForm';
import { BookingCreateModal } from '../Booking';

function SkeletonCard() {
  return <div className="skeleton h-[400px] rounded-2xl border border-gray-100 bg-white" />;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <p className="text-5xl">🛏️</p>
      <h3 className="mt-3 text-xl font-semibold text-gray-900">No rooms found</h3>
      <p className="mt-1 text-sm text-gray-500">Try adjusting your filters and search values.</p>
    </div>
  );
}

export default function RoomList({ hotelId = null, simplified = false }) {
  const navigate = useNavigate();
  const token = getTokenFromStorage();
  const isAdmin = getRoleFromStorage() === 'ADMIN';

  const initialFilters = hotelId
    ? { ...DEFAULT_FILTER_STATE, hotelId }
    : DEFAULT_FILTER_STATE;

  const {
    rooms,
    totalPages,
    currentPage,
    loading,
    error,
    filters,
    setFilters,
    goToPage,
    refetch,
  } = useRooms(initialFilters);

  const { deleteRoom, loading: deleting } = useRoomMutations(refetch);

  const [activeRoom, setActiveRoom] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookingRoomId, setBookingRoomId] = useState(null);

  const pages = useMemo(() => {
    return Array.from({ length: totalPages || 0 }, (_, index) => index);
  }, [totalPages]);

  if (!token && !hotelId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">Please sign in to view room details.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {!simplified && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Room Directory</h2>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveRoom(null);
                setIsFormOpen(true);
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Room
            </button>
          )}
        </div>
      )}

      {!simplified && (
        <RoomFilterBar
          filters={filters}
          isAdmin={isAdmin}
          onFiltersChange={(next) => {
            setFilters(next);
            goToPage(0);
          }}
        />
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onViewDetail={() => navigate(`/rooms/${room.id}`)}
              onBookThisRoom={() => setBookingRoomId(room.id)}
              onEdit={() => {
                setActiveRoom(room);
                setIsFormOpen(true);
              }}
              onDelete={async () => {
                if (!isAdmin || deleting) return;
                const confirmed = window.confirm(`Delete room "${room.roomNumber}"?`);
                if (!confirmed) return;
                await deleteRoom(room.id);
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>

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

          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isFormOpen && (
        <RoomForm
          room={activeRoom}
          hotelId={hotelId}
          onClose={() => {
            setIsFormOpen(false);
            setActiveRoom(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setActiveRoom(null);
            refetch();
          }}
        />
      )}

      <BookingCreateModal
        roomId={bookingRoomId || 0}
        isOpen={Boolean(bookingRoomId)}
        onClose={() => setBookingRoomId(null)}
      />
    </section>
  );
}

RoomList.propTypes = {
  hotelId: PropTypes.number,
  simplified: PropTypes.bool,
};

RoomList.defaultProps = {
  hotelId: null,
  simplified: false,
};

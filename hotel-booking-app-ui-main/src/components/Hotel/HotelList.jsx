import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useHotels from '../../hooks/useHotels';
import useHotelMutations from '../../hooks/useHotelMutations';
import { searchHotelsWithAi } from '../../services/hotelService';
import { useToast } from '../ui/ToastProvider';
import RoomCard from '../Room/RoomCard';
import {
  DEFAULT_FILTER_STATE,
  getRoleFromStorage,
  getTokenFromStorage,
} from '../../constants/hotelConstants';
import HotelFilterBar from './HotelFilterBar';
import HotelCard from './HotelCard';
import HotelForm from './HotelForm';
import AiSearchBox from './AiSearchBox';

function SkeletonCard() {
  return <div className="skeleton h-[380px] rounded-2xl border border-gray-100 bg-white" />;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <p className="text-5xl">🏨</p>
      <h3 className="mt-3 text-xl font-semibold text-gray-900">No hotels found</h3>
      <p className="mt-1 text-sm text-gray-500">Try adjusting your filters and search values.</p>
    </div>
  );
}

function AiEmptyState({ query, onClear }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-10 text-center shadow-sm">
      <p className="text-5xl">🤖</p>
      <h3 className="mt-3 text-xl font-semibold text-indigo-900">No AI matches found</h3>
      <p className="mt-1 text-sm text-indigo-700">
        We could not find hotels for <span className="font-mono">{query}</span>. Try rephrasing your request with location, dates, or budget.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Clear AI Search
      </button>
    </div>
  );
}

export default function HotelList() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = getTokenFromStorage();
  const isAdmin = getRoleFromStorage() === 'ADMIN';

  const {
    hotels,
    totalPages,
    currentPage,
    loading,
    error,
    filters,
    setFilters,
    goToPage,
    refetch,
  } = useHotels(DEFAULT_FILTER_STATE);

  const { deleteHotel, loading: deleting } = useHotelMutations(refetch);

  const [activeHotel, setActiveHotel] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);

  const aiSearchActive = Boolean(aiResponse && aiQuery);
  const displayedHotels = aiSearchActive ? (aiResponse?.hotels || []) : hotels;

  const runAiSearch = async (query) => {
    setAiLoading(true);
    setAiError('');

    try {
      const response = await searchHotelsWithAi(query);
      setAiQuery(response?.query || query);
      setAiResponse(response);
    } catch (err) {
      const message = err?.message || 'Failed to run AI search.';
      setAiError(message);
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiQuery('');
    setAiResponse(null);
    setAiError('');
  };

  const pages = useMemo(() => {
    return Array.from({ length: totalPages || 0 }, (_, index) => index);
  }, [totalPages]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">Please sign in to view the hotel listing.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Hotel Directory</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setActiveHotel(null);
              setIsFormOpen(true);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Hotel
          </button>
        )}
      </div>

      <AiSearchBox
        activeQuery={aiQuery}
        isLoading={aiLoading}
        onSearch={runAiSearch}
        onClear={clearAiSearch}
      />

      {aiSearchActive && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-900">
            AI Search Results for: <span className="font-mono">{aiQuery}</span>
          </p>
          <p className="mt-1 text-xs text-indigo-700">
            Hotels: {aiResponse?.totalHotels ?? 0}
            {' | '}
            Available Rooms: {aiResponse?.totalAvailableRooms ?? 0}
          </p>
        </div>
      )}

      {aiError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{aiError}</p>
        </div>
      )}

      <HotelFilterBar
        filters={filters}
        isAdmin={isAdmin}
        onFiltersChange={(next) => {
          setFilters(next);
          goToPage(0);
        }}
      />

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

      {loading && !aiSearchActive ? (
        <div className="grid grid-cols-1 gap-5 transition-all duration-300 ease-out sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : aiSearchActive && displayedHotels.length === 0 ? (
        <AiEmptyState query={aiQuery} onClear={clearAiSearch} />
      ) : displayedHotels.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 transition-all duration-300 ease-out sm:grid-cols-2 lg:grid-cols-3">
          {displayedHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onViewDetail={() => navigate(`/hotels/${hotel.id}`)}
              onEdit={() => {
                setActiveHotel(hotel);
                setIsFormOpen(true);
              }}
              onDelete={async () => {
                if (!isAdmin || deleting) return;
                const confirmed = window.confirm(`Delete hotel "${hotel.name}"?`);
                if (!confirmed) return;
                await deleteHotel(hotel.id);
              }}
            />
          ))}
        </div>
      )}

      {aiSearchActive && aiResponse?.availabilitySearch && (
        <div className="space-y-4 transition-all duration-300 ease-out">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">Available Rooms for Your Date Range</p>
            <p className="mt-1 text-xs text-emerald-700">
              {aiResponse?.totalAvailableRooms ?? 0} room(s) available
            </p>
          </div>

          {Array.isArray(aiResponse?.availableRooms) && aiResponse.availableRooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aiResponse.availableRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onViewDetail={() => navigate(`/rooms/${room.id}`)}
                  onBookThisRoom={() => navigate(`/rooms/${room.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              No available rooms found for the requested dates.
            </div>
          )}
        </div>
      )}

      {!aiSearchActive && totalPages > 1 && (
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
        <HotelForm
          hotel={activeHotel}
          onClose={() => {
            setIsFormOpen(false);
            setActiveHotel(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setActiveHotel(null);
            refetch();
          }}
        />
      )}
    </section>
  );
}

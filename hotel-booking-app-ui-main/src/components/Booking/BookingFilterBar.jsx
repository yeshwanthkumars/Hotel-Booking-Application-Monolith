import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import { BOOKING_STATUS, DEFAULT_FILTER_STATE, PAYMENT_STATUS, SORT_OPTIONS } from '../../constants/bookingConstants';

function toFilterState(params) {
  const [sortBy = 'checkInDate', sortDir = 'desc'] = (params.get('sort') || 'checkInDate:desc').split(':');
  return {
    roomId: params.get('roomId') || '',
    guestName: params.get('guestName') || '',
    checkInFrom: params.get('checkInFrom') || '',
    checkInTo: params.get('checkInTo') || '',
    bookingStatus: params.get('bookingStatus') || '',
    paymentStatus: params.get('paymentStatus') || '',
    sortBy,
    sortDir,
  };
}

export default function BookingFilterBar({ filters, onFiltersChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  useEffect(() => {
    const fromParams = toFilterState(searchParams);
    onFiltersChange(fromParams);
  }, [searchParams, onFiltersChange]);

  const sortValue = useMemo(() => `${draft.sortBy || 'checkInDate'}:${draft.sortDir || 'desc'}`, [draft.sortBy, draft.sortDir]);

  const applySearch = () => {
    const params = new URLSearchParams();
    Object.entries(draft).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      if (key === 'sortBy' || key === 'sortDir') return;
      params.set(key, String(value));
    });
    params.set('sort', `${draft.sortBy || 'checkInDate'}:${draft.sortDir || 'desc'}`);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setDraft(DEFAULT_FILTER_STATE);
    setSearchParams(new URLSearchParams());
    onFiltersChange(DEFAULT_FILTER_STATE);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Room ID</span>
          <input
            type="number"
            min="1"
            value={draft.roomId}
            onChange={(e) => setDraft((prev) => ({ ...prev, roomId: e.target.value }))}
            placeholder="Room ID"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Guest Name</span>
          <input
            type="text"
            value={draft.guestName}
            onChange={(e) => setDraft((prev) => ({ ...prev, guestName: e.target.value }))}
            placeholder="Search guest"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Check-in From</span>
          <input
            type="date"
            value={draft.checkInFrom}
            onChange={(e) => setDraft((prev) => ({ ...prev, checkInFrom: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Check-in To</span>
          <input
            type="date"
            value={draft.checkInTo}
            onChange={(e) => setDraft((prev) => ({ ...prev, checkInTo: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Booking Status</span>
          <select
            value={draft.bookingStatus}
            onChange={(e) => setDraft((prev) => ({ ...prev, bookingStatus: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All</option>
            {BOOKING_STATUS.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Payment Status</span>
          <select
            value={draft.paymentStatus}
            onChange={(e) => setDraft((prev) => ({ ...prev, paymentStatus: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All</option>
            {PAYMENT_STATUS.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm xl:col-span-2">
          <span className="font-medium text-gray-700">Sort</span>
          <select
            value={sortValue}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(':');
              setDraft((prev) => ({ ...prev, sortBy, sortDir }));
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort.value} value={sort.value}>{sort.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={applySearch}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}

BookingFilterBar.propTypes = {
  filters: PropTypes.shape({
    roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    guestName: PropTypes.string,
    checkInFrom: PropTypes.string,
    checkInTo: PropTypes.string,
    bookingStatus: PropTypes.string,
    paymentStatus: PropTypes.string,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
};

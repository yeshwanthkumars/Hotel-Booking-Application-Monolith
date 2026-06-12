import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_FILTER_STATE,
  ROOM_TYPES,
  ROOM_STATUS,
  SORT_OPTIONS,
  getRoleFromStorage,
} from '../../constants/roomConstants';

export default function RoomFilterBar({ filters, onFiltersChange, isAdmin }) {
  const [roomNumberInput, setRoomNumberInput] = useState(filters.roomNumber || '');
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice || '');
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice || '');
  const debounceRef = useRef({});

  const canManage = useMemo(() => {
    if (typeof isAdmin === 'boolean') {
      return isAdmin;
    }
    return getRoleFromStorage() === 'ADMIN';
  }, [isAdmin]);

  const runDebouncedFilter = (key, value) => {
    const timer = debounceRef.current[key];
    if (timer) {
      window.clearTimeout(timer);
    }

    debounceRef.current[key] = window.setTimeout(() => {
      onFiltersChange({ [key]: value });
    }, 400);
  };

  const applyFilter = (patch) => {
    onFiltersChange(patch);
  };

  const clearAll = () => {
    setRoomNumberInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    onFiltersChange(DEFAULT_FILTER_STATE);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Room Number</span>
          <input
            type="text"
            value={roomNumberInput}
            onChange={(e) => {
              setRoomNumberInput(e.target.value);
              runDebouncedFilter('roomNumber', e.target.value);
            }}
            placeholder="Room number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Room Type</span>
          <select
            value={filters.roomType || ''}
            onChange={(e) => applyFilter({ roomType: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Types</option>
            {ROOM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Status</span>
          <select
            value={filters.status || ''}
            onChange={(e) => applyFilter({ status: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Status</option>
            {ROOM_STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Min Price</span>
          <input
            type="number"
            value={minPriceInput}
            onChange={(e) => {
              setMinPriceInput(e.target.value);
              runDebouncedFilter('minPrice', e.target.value ? Number(e.target.value) : '');
            }}
            placeholder="Min price"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Max Price</span>
          <input
            type="number"
            value={maxPriceInput}
            onChange={(e) => {
              setMaxPriceInput(e.target.value);
              runDebouncedFilter('maxPrice', e.target.value ? Number(e.target.value) : '');
            }}
            placeholder="Max price"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        {canManage && (
          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Status Filter</span>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.isActive === true}
                onChange={(e) => applyFilter({ isActive: e.target.checked ? true : '' })}
                className="h-4 w-4 rounded border-gray-300"
              />
              Active only
            </label>
          </label>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm text-gray-700">
          Sort
          <select
            value={`${filters.sortBy}:${filters.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(':');
              applyFilter({ sortBy, sortDir });
            }}
            className="ml-2 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={clearAll}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

RoomFilterBar.propTypes = {
  filters: PropTypes.shape({
    roomNumber: PropTypes.string,
    roomType: PropTypes.string,
    status: PropTypes.string,
    minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
};

RoomFilterBar.defaultProps = {
  isAdmin: undefined,
};

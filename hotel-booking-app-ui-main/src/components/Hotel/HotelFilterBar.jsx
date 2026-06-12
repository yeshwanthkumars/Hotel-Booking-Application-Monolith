import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_FILTER_STATE,
  HOTEL_TYPES,
  STAR_RATINGS,
  getRoleFromStorage,
} from '../../constants/hotelConstants';

export default function HotelFilterBar({ filters, onFiltersChange, isAdmin }) {
  const [nameInput, setNameInput] = useState(filters.name || '');
  const [cityInput, setCityInput] = useState(filters.city || '');
  const [countryInput, setCountryInput] = useState(filters.country || '');
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
    setNameInput('');
    setCityInput('');
    setCountryInput('');
    onFiltersChange(DEFAULT_FILTER_STATE);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Search Name</span>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              runDebouncedFilter('name', e.target.value);
            }}
            placeholder="Hotel name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">City</span>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              runDebouncedFilter('city', e.target.value);
            }}
            placeholder="City"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Country</span>
          <input
            type="text"
            value={countryInput}
            onChange={(e) => {
              setCountryInput(e.target.value);
              runDebouncedFilter('country', e.target.value);
            }}
            placeholder="Country"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-gray-700">Hotel Type</span>
          <select
            value={filters.hotelType || ''}
            onChange={(e) => applyFilter({ hotelType: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Types</option>
            {HOTEL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Star Rating</span>
        {STAR_RATINGS.map((rating) => {
          const active = Number(filters.starRating) === rating;
          return (
            <button
              key={rating}
              type="button"
              onClick={() => applyFilter({ starRating: active ? '' : rating })}
              className={`rounded-lg border px-3 py-1 text-sm ${active ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {'★'.repeat(rating)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => applyFilter({ starRating: '' })}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>

        {canManage && (
          <label className="ml-auto inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.isActive === true}
              onChange={(e) => applyFilter({ isActive: e.target.checked ? true : '' })}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active only
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
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="city:asc">City (A-Z)</option>
            <option value="city:desc">City (Z-A)</option>
            <option value="starRating:desc">Star Rating (High-Low)</option>
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

HotelFilterBar.propTypes = {
  filters: PropTypes.shape({
    name: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    hotelType: PropTypes.string,
    starRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
};

HotelFilterBar.defaultProps = {
  isAdmin: undefined,
};

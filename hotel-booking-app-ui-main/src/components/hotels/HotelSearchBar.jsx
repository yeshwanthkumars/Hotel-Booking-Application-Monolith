import { useState, useEffect, useRef } from 'react';

export default function HotelSearchBar({ onSearch, onLocationFilter, isAdmin }) {
  const onSearchRef = useRef(onSearch);
  const onLocationFilterRef = useRef(onLocationFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    onLocationFilterRef.current = onLocationFilter;
  }, [onLocationFilter]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce location query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  // Trigger search on debounced values change
  useEffect(() => {
    if (onSearchRef.current) {
      onSearchRef.current(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (onLocationFilterRef.current) {
      onLocationFilterRef.current(debouncedLocation);
    }
  }, [debouncedLocation]);

  const handleClear = () => {
    setSearchQuery('');
    setLocationQuery('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hotel Name Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isAdmin ? 'Search Hotels' : 'Find Hotels'}
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by hotel name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Location
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by location…"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      {(searchQuery || locationQuery) && (
        <button
          onClick={handleClear}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  );
}

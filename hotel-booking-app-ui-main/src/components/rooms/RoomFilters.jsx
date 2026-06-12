import { useEffect, useRef, useState } from 'react';

export default function RoomFilters({ onChange, initialHotelId = '' }) {
  const onChangeRef = useRef(onChange);
  const [roomNumber, setRoomNumber] = useState('');
  const [hotelId, setHotelId] = useState(initialHotelId ? String(initialHotelId) : '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current?.({ roomNumber, hotelId, minPrice, maxPrice });
    }, 400);

    return () => clearTimeout(timer);
  }, [roomNumber, hotelId, minPrice, maxPrice]);

  const resetFilters = () => {
    setRoomNumber('');
    setHotelId(initialHotelId ? String(initialHotelId) : '');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 201"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hotel ID</label>
          <input
            type="number"
            min="1"
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            placeholder="e.g. 12"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="500"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {(roomNumber || hotelId || minPrice || maxPrice) && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

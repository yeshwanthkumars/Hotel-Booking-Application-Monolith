import { useEffect, useRef, useState } from 'react';

export default function BookingFilters({ onChange, showGuestFilter = true, defaultGuestName = '' }) {
  const onChangeRef = useRef(onChange);
  const [roomId, setRoomId] = useState('');
  const [guestName, setGuestName] = useState(defaultGuestName);
  const [checkInFrom, setCheckInFrom] = useState('');
  const [checkInTo, setCheckInTo] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current?.({ roomId, guestName, checkInFrom, checkInTo });
    }, 400);

    return () => clearTimeout(timer);
  }, [roomId, guestName, checkInFrom, checkInTo]);

  const clearFilters = () => {
    setRoomId('');
    setGuestName(defaultGuestName);
    setCheckInFrom('');
    setCheckInTo('');
  };

  const hasAny = roomId || (showGuestFilter && guestName !== defaultGuestName) || checkInFrom || checkInTo;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Room ID</label>
          <input
            type="number"
            min="1"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. 33"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        {showGuestFilter ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Guest Name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Search guest"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Guest Name</label>
            <input
              type="text"
              value={defaultGuestName}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Check-In From</label>
          <input
            type="date"
            value={checkInFrom}
            onChange={(e) => setCheckInFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Check-In To</label>
          <input
            type="date"
            value={checkInTo}
            onChange={(e) => setCheckInTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {hasAny && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

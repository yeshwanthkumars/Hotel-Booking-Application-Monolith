import { formatINR } from '../../utils/currency';

function StatCard({ icon, label, value, note, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function BookingRow({ booking }) {
  const today = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const bookingStatus = booking.bookingStatus;

  let status = 'Upcoming';
  let statusClass = 'bg-blue-100 text-blue-700';

  if (bookingStatus === 'CANCELLED') {
    status = 'Cancelled';
    statusClass = 'bg-red-100 text-red-700';
  } else if (bookingStatus === 'NO_SHOW') {
    status = 'No Show';
    statusClass = 'bg-slate-200 text-slate-700';
  } else if (bookingStatus === 'COMPLETED') {
    status = 'Completed';
    statusClass = 'bg-gray-100 text-gray-600';
  } else if (today >= checkInDate && today <= checkOutDate) {
    status = 'Active';
    statusClass = 'bg-green-100 text-green-700';
  } else if (today > checkOutDate) {
    status = 'Completed';
    statusClass = 'bg-gray-100 text-gray-600';
  }

  return (
    <tr className="border-t border-gray-100 transition-colors hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{booking.id}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{booking.guestName || 'Guest'}</td>
      <td className="px-6 py-4 text-sm text-gray-700">Room {booking.roomId}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{checkInDate.toLocaleDateString()}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{checkOutDate.toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>{status}</span>
      </td>
    </tr>
  );
}

function HotelTile({ hotel }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hotel #{hotel.id}</p>
          <h4 className="mt-1 text-base font-semibold text-gray-900">{hotel.name}</h4>
          <p className="mt-1 text-sm text-gray-500">{hotel.location}</p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Live</span>
      </div>
    </div>
  );
}

function RoomTile({ room }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">Room {room.roomNumber}</p>
        <p className="text-xs text-gray-500">Hotel ID {room.hotelId}</p>
      </div>
      <div className="text-sm font-semibold text-gray-900">{formatINR(room.price)}</div>
    </div>
  );
}

export default function AdminDashboard({ bookings, hotels, rooms, hotelCount, roomCount, loading, error, user }) {
  const today = new Date();
  const isBookableStatus = (booking) => ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus);

  const activeBookings = bookings.filter((booking) => {
    if (!isBookableStatus(booking)) return false;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return today >= checkIn && today <= checkOut;
  });
  const upcomingBookings = bookings.filter((booking) => isBookableStatus(booking) && new Date(booking.checkInDate) > today);
  const recentBookings = [...bookings].sort((a, b) => b.id - a.id).slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Welcome back, {user?.username}! 👋</h2>
            <p className="mt-2 text-sm text-indigo-100 sm:text-base">YK StayEase operations snapshot from your live hotel inventory.</p>
          </div>
          <div className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            {today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<span className="text-2xl">🏨</span>} label="Hotels" value={hotelCount} note="Live hotel records" color="bg-blue-100" />
          <StatCard icon={<span className="text-2xl">🔑</span>} label="Rooms" value={roomCount} note="Rooms currently in system" color="bg-purple-100" />
          <StatCard icon={<span className="text-2xl">📋</span>} label="Bookings" value={bookings.length} note="Loaded from backend" color="bg-green-100" />
          <StatCard icon={<span className="text-2xl">🟢</span>} label="Active stays" value={activeBookings.length} note={`${upcomingBookings.length} upcoming`} color="bg-orange-100" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Latest Hotels</h3>
              <p className="mt-1 text-sm text-gray-500">Actual hotel records from the API</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{hotelCount} total</span>
          </div>
          <div className="grid gap-4">
            {hotels.length > 0 ? hotels.map((hotel) => <HotelTile key={hotel.id} hotel={hotel} />) : <p className="text-sm text-gray-500">No hotels loaded.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Latest Rooms</h3>
              <p className="mt-1 text-sm text-gray-500">Prices are shown in Indian rupees</p>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">{roomCount} total</span>
          </div>
          <div className="grid gap-3">
            {rooms.length > 0 ? rooms.map((room) => <RoomTile key={room.id} room={room} />) : <p className="text-sm text-gray-500">No rooms loaded.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="mt-1 text-sm text-gray-500">Latest reservations loaded from the backend</p>
        </div>

        {error ? (
          <div className="px-6 py-5 text-sm text-red-600">{error}</div>
        ) : recentBookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-gray-500">No bookings available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {recentBookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
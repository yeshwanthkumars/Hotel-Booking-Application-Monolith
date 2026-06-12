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

function HotelCard({ hotel }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hotel #{hotel.id}</p>
      <h4 className="mt-2 text-lg font-semibold text-gray-900">{hotel.name}</h4>
      <p className="mt-1 text-sm text-gray-500">{hotel.location}</p>
    </div>
  );
}

function BookingCard({ booking }) {
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const daysUntilCheckIn = Math.ceil((checkIn - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-gray-900">Booking #{booking.id}</h4>
          <p className="mt-1 text-sm text-gray-500">Room {booking.roomId}</p>
        </div>
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {daysUntilCheckIn > 0 ? `In ${daysUntilCheckIn} days` : 'Today'}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div>Check-in: {checkIn.toLocaleDateString()}</div>
        <div>Check-out: {checkOut.toLocaleDateString()}</div>
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
      <td className="px-6 py-4 text-sm text-gray-700">Room {booking.roomId}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{checkInDate.toLocaleDateString()}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{checkOutDate.toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>{status}</span>
      </td>
    </tr>
  );
}

export default function UserDashboard({ bookings, hotels, loading, error, user }) {
  const today = new Date();
  const isBookableStatus = (booking) => ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus);

  const upcomingBookings = bookings
    .filter((booking) => isBookableStatus(booking) && new Date(booking.checkInDate) > today)
    .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate))
    .slice(0, 3);
  const recentBookings = [...bookings].sort((a, b) => b.id - a.id).slice(0, 5);
  const activeBookings = bookings.filter((booking) => {
    if (!isBookableStatus(booking)) return false;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return today >= checkIn && today <= checkOut;
  });
  const completedBookings = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED' || new Date(booking.checkOutDate) < today);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Welcome back, {user?.username}! 👋</h2>
            <p className="mt-2 text-sm text-blue-100 sm:text-base">Your YK StayEase bookings and available hotel inventory at a glance.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <StatCard icon={<span className="text-2xl">📋</span>} label="Bookings" value={bookings.length} note="Loaded from your account" color="bg-white/20" />
            <StatCard icon={<span className="text-2xl">🟢</span>} label="Active" value={activeBookings.length} note="Currently in stay window" color="bg-white/20" />
          </div>
        </div>
      </div>

      {!loading && upcomingBookings.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Your Upcoming Stays 🏨</h3>
              <p className="mt-1 text-sm text-gray-500">Bookings pulled from the authenticated user endpoint</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Hotels in the system</h3>
            <p className="mt-1 text-sm text-gray-500">Real hotel records currently available to browse</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(hotels || []).length > 0 ? hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />) : <p className="text-sm text-gray-500">No hotels loaded.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="mt-1 text-sm text-gray-500">Your latest reservation activity</p>
        </div>

        {error ? (
          <div className="px-6 py-5 text-sm text-red-600">{error}</div>
        ) : recentBookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-gray-500">No bookings found.</p>
            <p className="mt-1 text-sm text-gray-400">Start by booking a room from the rooms page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Booking</th>
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

      {!loading && completedBookings.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm text-gray-600">
          You have {completedBookings.length} completed booking{completedBookings.length === 1 ? '' : 's'} on record.
        </div>
      )}
    </div>
  );
}
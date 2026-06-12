import { useEffect, useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';
import { useAuth } from '../context/AuthContext';
import { getAllBookings, getMyBookings } from '../services/bookingService';
import { getAllHotels } from '../services/hotelService';
import { getAllRooms } from '../services/roomService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hotelCount, setHotelCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    let isActive = true;

    const loadDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [bookingResponse, hotelResponse, roomResponse] = await Promise.all([
          isAdmin
            ? getAllBookings({ page: 0, size: 1000, sortBy: 'checkInDate', sortDir: 'desc' })
            : getMyBookings(0, 1000),
          getAllHotels(0, 3, 'name', 'asc'),
          getAllRooms(0, 3, 'id', 'asc'),
        ]);

        if (!isActive) {
          return;
        }

        setBookings(bookingResponse.content || []);
        setHotels(hotelResponse.content || []);
        setRooms(roomResponse.content || []);
        setHotelCount(hotelResponse.totalElements || hotelResponse.content?.length || 0);
        setRoomCount(roomResponse.totalElements || roomResponse.content?.length || 0);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setError(err.response?.data?.message || 'Failed to load dashboard data. Please refresh the page.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  return (
    <DashboardLayout>
      {isAdmin ? (
        <AdminDashboard
          bookings={bookings}
          hotels={hotels}
          rooms={rooms}
          hotelCount={hotelCount}
          roomCount={roomCount}
          loading={loading}
          error={error}
          user={user}
        />
      ) : (
        <UserDashboard
          bookings={bookings}
          hotels={hotels}
          rooms={rooms}
          loading={loading}
          error={error}
          user={user}
        />
      )}
    </DashboardLayout>
  );
}

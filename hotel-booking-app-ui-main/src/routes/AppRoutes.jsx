import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import HotelsPage from '../pages/HotelsPage';
import HotelDetailsPage from '../pages/HotelDetailsPage';
import AdminHotelsPage from '../pages/AdminHotelsPage';
import RoomsPage from '../pages/RoomsPage';
import RoomDetailsPage from '../pages/RoomDetailsPage';
import AdminRoomsPage from '../pages/AdminRoomsPage';
import BookingDetailsPage from '../pages/BookingDetailsPage';
import BookingEditPage from '../pages/BookingEditPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import AdminBookingsPage from '../pages/AdminBookingsPage';
import ProfilePage from '../pages/ProfilePage';
import PaymentPage from '../pages/PaymentPage';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailsPage />} />
        <Route path="/hotels/:hotelId/rooms" element={<RoomsPage />} />
        <Route path="/bookings/me" element={<MyBookingsPage />} />
        <Route path="/my-bookings" element={<Navigate to="/bookings/me" replace />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/hotels" element={<AdminHotelsPage />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/bookings" element={<AdminBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailsPage />} />
          <Route path="/bookings/:id/edit" element={<BookingEditPage />} />
          <Route path="/admin/bookings" element={<Navigate to="/bookings" replace />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

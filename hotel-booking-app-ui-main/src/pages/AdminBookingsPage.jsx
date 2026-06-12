import DashboardLayout from '../components/dashboard/DashboardLayout';
import { BookingList } from '../components/Booking';

export default function AdminBookingsPage() {
  return (
    <DashboardLayout>
      <BookingList />
    </DashboardLayout>
  );
}

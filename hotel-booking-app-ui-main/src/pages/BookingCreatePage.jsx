import DashboardLayout from '../components/dashboard/DashboardLayout';
import { BookingForm } from '../components/Booking';

export default function BookingCreatePage() {
  return (
    <DashboardLayout>
      <BookingForm inline onSuccess={() => {}} />
    </DashboardLayout>
  );
}

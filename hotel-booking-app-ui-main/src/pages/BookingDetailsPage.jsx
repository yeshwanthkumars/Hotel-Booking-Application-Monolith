import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { BookingDetail } from '../components/Booking';

export default function BookingDetailsPage() {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <BookingDetail bookingId={parseInt(id, 10)} />
    </DashboardLayout>
  );
}

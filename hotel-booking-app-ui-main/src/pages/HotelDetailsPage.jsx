import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { HotelDetail } from '../components/Hotel';

export default function HotelDetailsPage() {
  const { id } = useParams();
  return (
    <DashboardLayout>
      <HotelDetail hotelId={id} />
    </DashboardLayout>
  );
}

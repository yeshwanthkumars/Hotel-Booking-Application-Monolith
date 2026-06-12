import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { RoomDetail } from '../components/Room';

export default function RoomDetailsPage() {
  const { id } = useParams();
  return (
    <DashboardLayout>
      <RoomDetail roomId={parseInt(id, 10)} />
    </DashboardLayout>
  );
}

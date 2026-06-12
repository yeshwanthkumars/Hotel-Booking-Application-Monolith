import DashboardLayout from '../components/dashboard/DashboardLayout';
import { RoomList } from '../components/Room';

export default function AdminRoomsPage() {
  return (
    <DashboardLayout>
      <RoomList />
    </DashboardLayout>
  );
}


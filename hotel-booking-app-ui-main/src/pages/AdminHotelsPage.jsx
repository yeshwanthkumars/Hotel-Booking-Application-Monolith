import DashboardLayout from '../components/dashboard/DashboardLayout';
import { HotelList } from '../components/Hotel';

export default function AdminHotelsPage() {
  return (
    <DashboardLayout>
      <HotelList />
    </DashboardLayout>
  );
}

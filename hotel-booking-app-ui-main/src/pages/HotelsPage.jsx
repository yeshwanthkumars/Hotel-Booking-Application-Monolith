import DashboardLayout from '../components/dashboard/DashboardLayout';
import { HotelList } from '../components/Hotel';

export default function HotelsPage() {
  return (
    <DashboardLayout>
      <HotelList />
    </DashboardLayout>
  );
}

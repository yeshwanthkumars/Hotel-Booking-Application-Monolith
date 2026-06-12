import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { BookingForm } from '../components/Booking';
import useBookingById from '../hooks/useBookingById';

export default function BookingEditPage() {
  const { id } = useParams();
  const bookingId = parseInt(id, 10);
  const { booking, loading, error, refetch } = useBookingById(bookingId);

  return (
    <DashboardLayout>
      {loading ? (
        <div className="skeleton h-[420px] rounded-2xl border border-gray-100" />
      ) : error || !booking ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error || 'Booking not found.'}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <BookingForm booking={booking} inline onSuccess={() => refetch()} />
      )}
    </DashboardLayout>
  );
}

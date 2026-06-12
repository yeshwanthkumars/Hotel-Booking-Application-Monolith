import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { PaymentForm, PaymentSuccessCard } from '../components/Payment';
import { getMyBookings, getBookingById } from '../services/bookingService';
import { getTokenFromStorage, getRoleFromStorage } from '../constants/bookingConstants';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const id = parseInt(bookingId, 10);
  const token = getTokenFromStorage();
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const location = useLocation();
  const [paymentResult, setPaymentResult] = useState(null);
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');

  const fetchBooking = (active = { current: true }) => {
    setLoading(true);
    setError('');

    (async () => {
      try {
        if (isAdmin) {
          const data = await getBookingById(id);
          if (active.current) setBooking(data);
        } else {
          let found = null;
          let page = 0;
          const size = 50;
          while (!found) {
            const response = await getMyBookings(page, size);
            const items = response?.content ?? response ?? [];
            found = items.find((b) => b.id === id) || null;
            if (found || items.length < size) break;
            page += 1;
          }
          if (active.current) {
            if (found) {
              setBooking(found);
            } else {
              setError('Booking not found or you do not have access to it.');
            }
          }
        }
      } catch (err) {
        if (active.current) setError(err?.message || 'Failed to load booking details.');
      } finally {
        if (active.current) setLoading(false);
      }
    })();
  };

  useEffect(() => {
    if (location.state?.booking) return;
    const active = { current: true };
    fetchBooking(active);
    return () => { active.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refetch = () => {
    setBooking(null);
    fetchBooking();
  };

  if (!token) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
          <p className="mt-2 text-sm text-amber-700">Please sign in to complete payment.</p>
          <Link to="/login" className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
            Go to Login
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/bookings/me"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            My Bookings
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-sm text-gray-500">Booking #{bookingId}</p>
          </div>
        </div>

        {loading && (
          <div className="skeleton h-[360px] rounded-2xl border border-gray-100" />
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && booking && !paymentResult && (
          <>
            {booking.paymentStatus === 'PAID' ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <svg className="mx-auto h-10 w-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="mt-3 text-lg font-semibold text-emerald-800">Already Paid</h3>
                <p className="mt-1 text-sm text-emerald-700">
                  This booking has already been paid. Confirmation:{' '}
                  <span className="font-mono font-semibold">{booking.confirmationNumber}</span>
                </p>
                <Link
                  to="/bookings/me"
                  className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  View My Bookings
                </Link>
              </div>
            ) : (
              <PaymentForm booking={booking} onSuccess={setPaymentResult} />
            )}
          </>
        )}

        {paymentResult && <PaymentSuccessCard payment={paymentResult} />}
      </div>
    </DashboardLayout>
  );
}

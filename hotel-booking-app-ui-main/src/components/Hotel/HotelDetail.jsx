import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  IMAGE_ENDPOINT,
  PLACEHOLDER_HOTEL_IMAGE,
  getRoleFromStorage,
  getTokenFromStorage,
} from '../../constants/hotelConstants';
import useHotelById from '../../hooks/useHotelById';
import { RoomList } from '../Room';
import HotelForm from './HotelForm';

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatTime(timeValue) {
  if (!timeValue) return 'N/A';
  const [hours, minutes] = String(timeValue).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(timeValue);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HotelDetail({ hotelId }) {
  const navigate = useNavigate();
  const token = getTokenFromStorage();
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const { hotel, loading, error, refetch } = useHotelById(hotelId);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_HOTEL_IMAGE);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    if (!hotelId || !token) return;

    let objectUrl = null;
    axiosInstance
      .get(IMAGE_ENDPOINT(hotelId), { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setImgSrc(objectUrl);
      })
      .catch(() => {
        setImgSrc(PLACEHOLDER_HOTEL_IMAGE);
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [hotelId, token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">Please sign in to view hotel details.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="skeleton h-[420px] rounded-2xl border border-gray-100" />;
  }

  if (error || !hotel) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error || 'Hotel not found.'}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const sortedAmenities = Array.isArray(hotel.amenities)
    ? [...hotel.amenities].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setOpenForm(true)}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit Hotel
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <img
          src={imgSrc}
          alt={hotel.name}
          className="h-72 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_HOTEL_IMAGE;
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
          <p className="text-gray-600">{hotel.description || 'No description provided.'}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-medium">Location:</span> {hotel.location || 'N/A'}</p>
            <p><span className="font-medium">City:</span> {hotel.city || 'N/A'}</p>
            <p><span className="font-medium">State:</span> {hotel.state || 'N/A'}</p>
            <p><span className="font-medium">Country:</span> {hotel.country || 'N/A'}</p>
            <p><span className="font-medium">Type:</span> {hotel.hotelType || 'N/A'}</p>
            <p><span className="font-medium">Stars:</span> {hotel.starRating || 'N/A'}</p>
            <p><span className="font-medium">Active:</span> {hotel.isActive ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Address:</span> {hotel.address || 'N/A'}</p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Created: {formatDateTime(hotel.createdAt)}</p>
            <p>Updated: {formatDateTime(hotel.updatedAt)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            <p className="mt-2 text-sm text-gray-700">Phone: {hotel.phoneNumber || 'N/A'}</p>
            <p className="text-sm text-gray-700">Email: {hotel.email || 'N/A'}</p>
            <p className="text-sm text-gray-700">Address: {hotel.address || 'N/A'}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Check-in / Check-out</h3>
            <p className="mt-2 text-sm text-gray-700">Check-in: {formatTime(hotel.checkInTime)}</p>
            <p className="text-sm text-gray-700">Check-out: {formatTime(hotel.checkOutTime)}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
            {sortedAmenities.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No amenities listed.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {sortedAmenities.map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{item}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {openForm && (
        <HotelForm
          hotel={hotel}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            refetch();
          }}
        />
      )}

      <div className="mt-12 border-t border-gray-200 pt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Rooms in This Hotel</h3>
        <RoomList hotelId={hotel.id} simplified />
      </div>
    </section>
  );
}

HotelDetail.propTypes = {
  hotelId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

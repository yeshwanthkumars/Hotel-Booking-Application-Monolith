import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  IMAGE_ENDPOINT,
  PLACEHOLDER_ROOM_IMAGE,
  getRoomTypeMeta,
  getRoomStatusMeta,
  getRoleFromStorage,
  getTokenFromStorage,
  formatPrice,
} from '../../constants/roomConstants';
import useRoomById from '../../hooks/useRoomById';
import { BookingCreateModal } from '../Booking';
import RoomForm from './RoomForm';
import RoomImageUpload from './RoomImageUpload';

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export default function RoomDetail({ roomId }) {
  const navigate = useNavigate();
  const token = getTokenFromStorage();
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const { room, loading, error, refetch } = useRoomById(roomId);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_ROOM_IMAGE);
  const [openForm, setOpenForm] = useState(false);
  const [openBookingModal, setOpenBookingModal] = useState(false);

  useEffect(() => {
    if (!roomId || !token) return;

    let objectUrl = null;
    axiosInstance
      .get(IMAGE_ENDPOINT(roomId), { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setImgSrc(objectUrl);
      })
      .catch(() => {
        setImgSrc(PLACEHOLDER_ROOM_IMAGE);
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [roomId, token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-amber-800">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">Please sign in to view room details.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="skeleton h-[420px] rounded-2xl border border-gray-100" />;
  }

  if (error || !room) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error || 'Room not found.'}</p>
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

  const typeMeta = getRoomTypeMeta(room.roomType);
  const statusMeta = getRoomStatusMeta(room.status);
  const sortedAmenities = Array.isArray(room.amenities)
    ? [...room.amenities].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => setOpenBookingModal(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Book This Room
        </button>
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setOpenForm(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Edit Room
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Delete room "${room.roomNumber}"?`)) return;
                // TODO: Implement delete via mutation hook
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Room
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <img
              src={imgSrc}
              alt={`Room ${room.roomNumber}`}
              className="h-96 w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Room {room.roomNumber}</h2>
            {room.hotelName && <p className="mt-1 text-sm text-gray-500">Hotel: {room.hotelName}</p>}
            <div className="mt-3 space-y-2">
              {typeMeta && (
                <p className="inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
                   style={{ backgroundColor: typeMeta.color }}>
                  {typeMeta.label}
                </p>
              )}
              {statusMeta && (
                <p className="ml-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
                   style={{ backgroundColor: statusMeta.color }}>
                  {statusMeta.label}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-2xl font-bold text-indigo-600">{formatPrice(room.price)}</p>
              </div>
              {room.weekendPrice && room.weekendPrice > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Weekend Price</p>
                  <p className="text-lg font-semibold text-indigo-600">{formatPrice(room.weekendPrice)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Details</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {room.bedType && (
            <>
              <dt className="text-sm font-medium text-gray-500">Bed Type</dt>
              <dd className="text-sm text-gray-900">{room.bedType}</dd>
            </>
          )}
          {room.maxOccupancy && (
            <>
              <dt className="text-sm font-medium text-gray-500">Max Occupancy</dt>
              <dd className="text-sm text-gray-900">{room.maxOccupancy} guests</dd>
            </>
          )}
          {room.floorNumber && (
            <>
              <dt className="text-sm font-medium text-gray-500">Floor Number</dt>
              <dd className="text-sm text-gray-900">{room.floorNumber}</dd>
            </>
          )}
          {room.roomSizeInSqFt && (
            <>
              <dt className="text-sm font-medium text-gray-500">Room Size</dt>
              <dd className="text-sm text-gray-900">{room.roomSizeInSqFt} sq ft</dd>
            </>
          )}
          {room.viewType && (
            <>
              <dt className="text-sm font-medium text-gray-500">View Type</dt>
              <dd className="text-sm text-gray-900">{room.viewType}</dd>
            </>
          )}
          {room.description && (
            <>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="text-sm text-gray-900">{room.description}</dd>
            </>
          )}
          {room.createdAt && (
            <>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(room.createdAt)}</dd>
            </>
          )}
          {room.updatedAt && (
            <>
              <dt className="text-sm font-medium text-gray-500">Updated</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(room.updatedAt)}</dd>
            </>
          )}
        </dl>
      </div>

      {sortedAmenities.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {sortedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <RoomImageUpload roomId={roomId} onUploadSuccess={refetch} />
      )}

      {openForm && (
        <RoomForm
          room={room}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            refetch();
          }}
        />
      )}

      <BookingCreateModal
        roomId={roomId}
        isOpen={openBookingModal}
        onClose={() => setOpenBookingModal(false)}
      />
    </section>
  );
}

RoomDetail.propTypes = {
  roomId: PropTypes.number.isRequired,
};

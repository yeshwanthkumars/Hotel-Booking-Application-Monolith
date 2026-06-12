import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../api/axiosInstance';
import {
  IMAGE_ENDPOINT,
  PLACEHOLDER_ROOM_IMAGE,
  getRoomTypeMeta,
  getRoomStatusMeta,
  getRoleFromStorage,
  formatPrice,
} from '../../constants/roomConstants';

export default function RoomCard({ room, onEdit, onDelete, onViewDetail, onBookThisRoom }) {
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const typeMeta = getRoomTypeMeta(room.roomType);
  const statusMeta = getRoomStatusMeta(room.status);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_ROOM_IMAGE);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    axiosInstance
      .get(IMAGE_ENDPOINT(room.id), { responseType: 'blob' })
      .then((response) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setImgSrc(objectUrl);
      })
      .catch(() => {
        if (active) setImgSrc(PLACEHOLDER_ROOM_IMAGE);
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [room.id]);

  const handleCardClick = () => {
    if (onViewDetail) onViewDetail(room);
  };

  const safeAmenities = (amenities) => {
    if (!Array.isArray(amenities)) return [];
    return [...amenities].filter(Boolean).sort((a, b) => a.localeCompare(b));
  };

  const amenities = safeAmenities(room.amenities);
  const visibleAmenities = amenities.slice(0, 3);
  const remainingCount = Math.max(0, amenities.length - visibleAmenities.length);

  return (
    <article
      onClick={handleCardClick}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={`Room ${room.roomNumber}`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_ROOM_IMAGE;
          }}
        />
        {typeMeta && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: typeMeta.color }}
          >
            {typeMeta.label}
          </span>
        )}
        {statusMeta && (
          <span
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: statusMeta.color }}
          >
            {statusMeta.label}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
            Room {room.roomNumber}
          </h3>
          <p className="text-sm text-gray-500">{room.bedType || 'N/A'} Bed</p>
          {room.hotelName && <p className="text-xs text-gray-500">Hotel: {room.hotelName}</p>}
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xl font-bold text-indigo-600">{formatPrice(room.price)}</p>
            {room.weekendPrice && room.weekendPrice > 0 && (
              <p className="text-xs text-gray-500">Weekend: {formatPrice(room.weekendPrice)}</p>
            )}
          </div>
          <div className="text-xs text-gray-600">
            {room.floorNumber && <p>Floor {room.floorNumber}</p>}
            {room.maxOccupancy && <p>Max {room.maxOccupancy}</p>}
          </div>
        </div>

        {room.viewType && <p className="text-xs text-gray-500">🏞️ {room.viewType} View</p>}
        {room.roomSizeInSqFt && (
          <p className="text-xs text-gray-500">{room.roomSizeInSqFt} sq ft</p>
        )}

        {visibleAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700"
              >
                {amenity}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookThisRoom) onBookThisRoom(room);
            }}
            className="flex-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
          >
            Book This Room
          </button>

          {isAdmin && (
            <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(room);
              }}
              className="flex-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(room);
              }}
              className="flex-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Delete
            </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

RoomCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.number.isRequired,
    roomNumber: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    weekendPrice: PropTypes.number,
    roomType: PropTypes.string,
    bedType: PropTypes.string,
    maxOccupancy: PropTypes.number,
    floorNumber: PropTypes.number,
    roomSizeInSqFt: PropTypes.number,
    viewType: PropTypes.string,
    status: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    hotelName: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetail: PropTypes.func,
  onBookThisRoom: PropTypes.func,
};

RoomCard.defaultProps = {
  onEdit: undefined,
  onDelete: undefined,
  onViewDetail: undefined,
  onBookThisRoom: undefined,
};

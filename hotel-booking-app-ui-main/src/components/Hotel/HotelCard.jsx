import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../api/axiosInstance';
import {
  IMAGE_ENDPOINT,
  PLACEHOLDER_HOTEL_IMAGE,
  getHotelTypeMeta,
  getRoleFromStorage,
} from '../../constants/hotelConstants';

function formatTimeToLocal(timeValue) {
  if (!timeValue) return 'N/A';
  const [hours, minutes] = String(timeValue).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(timeValue);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function safeAmenities(amenities) {
  if (!Array.isArray(amenities)) return [];
  return [...amenities].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function countryToFlag(country) {
  if (!country || country.length < 2) return '';
  const code = country.trim().slice(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt()));
}

export default function HotelCard({ hotel, onEdit, onDelete, onViewDetail }) {
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const typeMeta = getHotelTypeMeta(hotel.hotelType);
  const amenities = safeAmenities(hotel.amenities);
  const visibleAmenities = amenities.slice(0, 4);
  const remainingCount = Math.max(0, amenities.length - visibleAmenities.length);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_HOTEL_IMAGE);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    axiosInstance
      .get(IMAGE_ENDPOINT(hotel.id), { responseType: 'blob' })
      .then((response) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setImgSrc(objectUrl);
      })
      .catch(() => {
        if (active) setImgSrc(PLACEHOLDER_HOTEL_IMAGE);
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [hotel.id]);

  const handleCardClick = () => {
    if (onViewDetail) onViewDetail(hotel);
  };

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
          alt={hotel.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_HOTEL_IMAGE;
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
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">{hotel.name}</h3>
          <p className="text-sm text-gray-500">{hotel.location}</p>
          <p className="mt-1 text-sm text-gray-600">
            {countryToFlag(hotel.country)} {hotel.city || 'Unknown city'}{hotel.country ? `, ${hotel.country}` : ''}
          </p>
        </div>

        <div className="text-sm">
          <span className="text-amber-500">{'★'.repeat(Number(hotel.starRating || 0))}</span>
          <span className="text-gray-300">{'☆'.repeat(5 - Number(hotel.starRating || 0))}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleAmenities.map((amenity) => (
            <span key={amenity} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
              {amenity}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">+{remainingCount} more</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <p>Check-in: <span className="font-medium text-gray-800">{formatTimeToLocal(hotel.checkInTime)}</span></p>
          <p>Check-out: <span className="font-medium text-gray-800">{formatTimeToLocal(hotel.checkOutTime)}</span></p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(hotel);
              }}
              className="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(hotel);
              }}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

HotelCard.propTypes = {
  hotel: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    city: PropTypes.string,
    country: PropTypes.string,
    starRating: PropTypes.number,
    hotelType: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetail: PropTypes.func,
};

HotelCard.defaultProps = {
  onEdit: null,
  onDelete: null,
  onViewDetail: null,
};

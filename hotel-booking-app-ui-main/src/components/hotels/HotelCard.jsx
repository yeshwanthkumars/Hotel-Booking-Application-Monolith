import { useState } from 'react';

export default function HotelCard({ hotel, onViewDetails, isAdmin, onEdit, onDelete }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:border-indigo-200"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 h-32 relative flex items-center justify-center">
        <span className="text-5xl">🏨</span>
        {isAdmin && isHovering && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <button
              onClick={() => onEdit(hotel)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(hotel)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{hotel.name}</h3>
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hotel.location}
        </p>

        {/* Meta info */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            ID: {hotel.id}
          </span>
        </div>

        {/* Action button */}
        {!isAdmin && (
          <button
            onClick={() => onViewDetails(hotel)}
            className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

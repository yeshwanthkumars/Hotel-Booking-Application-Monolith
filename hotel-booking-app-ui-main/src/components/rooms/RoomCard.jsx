import { formatINR } from '../../utils/currency';

export default function RoomCard({ room, onViewHotel, onBookRoom }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
      <div className="h-28 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-between px-5">
        <div>
          <p className="text-xs text-cyan-100 uppercase tracking-wide">Room</p>
          <h3 className="text-2xl font-bold text-white">{room.roomNumber}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🛏️</div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Hotel ID</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            {room.hotelId}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">Price / night</span>
          <span className="text-2xl font-bold text-gray-900">{formatINR(room.price)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onViewHotel?.(room.hotelId)}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Hotel
          </button>
          <button
            type="button"
            onClick={() => onBookRoom?.(room)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Book Room
          </button>
        </div>
      </div>
    </div>
  );
}

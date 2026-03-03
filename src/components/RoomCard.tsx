import { Users, Maximize2 } from 'lucide-react';
import { Room } from '../lib/supabase';
import { formatearPrecio } from '../lib/constants';

interface RoomCardProps {
  room: Room;
  hotelId: string;
  imageUrl?: string;
  onReservar: (hotelId: string, roomId: string) => void;
  onVerMas?: (hotelId: string) => void;
}

export default function RoomCard({ room, hotelId, imageUrl, onReservar, onVerMas }: RoomCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
        <img
          src={imageUrl || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="bg-white/95 text-gray-800 text-sm font-semibold px-2.5 py-1 rounded">
            {formatearPrecio(room.price_per_night)}/noche
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1.5 line-clamp-1">
          {room.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {room.description}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" aria-hidden />
            {room.capacity} {room.capacity === 1 ? 'huésped' : 'huéspedes'}
          </span>
          {room.size_sqm > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-4 h-4" aria-hidden />
              {room.size_sqm} m²
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onReservar(hotelId, room.id)}
            className="flex-1 bg-cyan-500 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-600 transition-colors text-sm touch-manipulation"
          >
            Reservar
          </button>
          {onVerMas && (
            <button
              type="button"
              onClick={() => onVerMas(hotelId)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-sm touch-manipulation"
            >
              Ver más
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

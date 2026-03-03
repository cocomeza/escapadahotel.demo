import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { HotelWithDetails } from '../lib/supabase';
import { formatearPrecio } from '../lib/constants';

interface HotelCardProps {
  hotel: HotelWithDetails;
  onSelect?: (id: string) => void;
}

export default function HotelCard({ hotel, onSelect }: HotelCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(hotel.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(hotel.id)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 touch-manipulation"
      aria-label={`Ver ${hotel.name}, ${hotel.location}`}
    >
      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
        <img
          src={hotel.main_image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-400 fill-current" aria-hidden />
          <span className="text-sm font-semibold text-gray-800">{hotel.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1.5 group-hover:text-cyan-500 transition-colors line-clamp-1">
          {hotel.name}
        </h3>

        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden />
          <p className="text-sm text-gray-600">{hotel.location}</p>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {hotel.description}
        </p>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
              >
                {amenity.name}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                +{hotel.amenities.length - 3} más
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
          <div>
            <p className="text-xs text-gray-500">Desde</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-500">
              {formatearPrecio(hotel.price_per_night)}
              <span className="text-sm text-gray-500 font-normal">/noche</span>
            </p>
          </div>
          <span className="bg-cyan-500 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap">
            Ver más
          </span>
        </div>
      </div>
    </article>
  );
}

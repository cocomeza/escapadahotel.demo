import { useState } from 'react';
import { X, Star, MapPin, Wifi, Coffee, Car, Wind, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import { HotelWithDetails } from '../lib/supabase';
import { formatearPrecio } from '../lib/constants';

interface HotelDetailsProps {
  hotel: HotelWithDetails;
  onClose: () => void;
  onReservar?: () => void;
  onContactar?: () => void;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  wifi: Wifi,
  coffee: Coffee,
  car: Car,
  'air-vent': Wind,
  utensils: Utensils,
};

export default function HotelDetails({ hotel, onClose, onReservar, onContactar }: HotelDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [hotel.main_image, ...(hotel.images?.map(img => img.url) || [])];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl">
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 sm:p-6 border-b gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">{hotel.name}</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-gray-600 hover:text-cyan-500 py-2 px-3 rounded-lg touch-manipulation hidden sm:block"
              >
                Volver al listado
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors touch-manipulation flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 md:h-96 bg-gray-900">
            <img
              src={allImages[currentImageIndex]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-800">{hotel.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{hotel.location}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Desde</p>
                <p className="text-2xl sm:text-3xl font-bold text-cyan-500">
                  {formatearPrecio(hotel.price_per_night)}
                  <span className="text-sm text-gray-500 font-normal">/noche</span>
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Servicios Incluidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hotel.amenities.map((amenity) => {
                    const Icon = iconMap[amenity.icon] || Wifi;
                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-cyan-50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-cyan-500" />
                        <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hotel.rooms && hotel.rooms.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Habitaciones disponibles</h3>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => {
                    const roomImage = hotel.images?.find((img) => img.room_id === room.id)?.url || hotel.main_image;
                    return (
                      <div
                        key={room.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-cyan-500 transition-colors flex flex-col sm:flex-row"
                      >
                        <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
                          <img
                            src={roomImage}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800 mb-2">{room.name}</h4>
                            <p className="text-gray-600 mb-3 line-clamp-2">{room.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Capacidad: {room.capacity} personas</span>
                              {room.size_sqm > 0 && <span>{room.size_sqm} m²</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end space-y-3">
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-cyan-500">
                                {formatearPrecio(room.price_per_night)}
                              </p>
                              <p className="text-sm text-gray-500">por noche</p>
                            </div>
                            <button
                              type="button"
                              onClick={onReservar}
                              className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-600 transition-colors font-medium touch-manipulation"
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onReservar}
                className="flex-1 bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors touch-manipulation"
              >
                Reservar ahora
              </button>
              <button
                type="button"
                onClick={onContactar}
                className="flex-1 border-2 border-cyan-500 text-cyan-500 py-3 rounded-lg font-medium hover:bg-cyan-50 transition-colors touch-manipulation"
              >
                Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

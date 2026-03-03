import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import RoomCard from '../components/RoomCard';
import Features from '../components/Features';
import Gallery from '../components/Gallery';
import { useHotels } from '../hooks/useHotels';
import { HOTEL_ESCAPADA, getRoomPlaceholderImage } from '../lib/constants';

export default function HomePage() {
  const navigate = useNavigate();
  const { hotels, loading, error } = useHotels();

  // Para la web de un hotel: tomamos el primer hotel (Hotel Escapada) y mostramos sus habitaciones
  const hotel = hotels[0] ?? null;
  const rooms = hotel?.rooms ?? [];

  const handleReservar = (hotelId: string, roomId: string) => {
    navigate(`/reservar/${hotelId}?roomId=${roomId}`);
  };

  const handleVerMas = (hotelId: string) => {
    navigate(`/hoteles/${hotelId}`);
  };

  return (
    <>
      <Hero onSearch={() => navigate('/reservar')} />

      {/* Bienvenida */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Bienvenidos al {HOTEL_ESCAPADA.nombre}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {HOTEL_ESCAPADA.bienvenida}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Check-in desde las {HOTEL_ESCAPADA.checkIn} · Check-out hasta las {HOTEL_ESCAPADA.checkOut}
          </p>
        </div>
      </section>

      {/* Nuestras habitaciones */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Nuestras habitaciones
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Elegí la opción que mejor se adapte a tu estadía
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              Error al cargar. Revisá tu conexión.
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded w-1/3 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 mb-4">
                Próximamente publicaremos nuestras habitaciones. Mientras tanto, contactanos para consultas.
              </p>
              <button
                type="button"
                onClick={() => navigate('/contacto')}
                className="text-cyan-500 font-medium hover:underline"
              >
                Ir a contacto
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.slice(0, 6).map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    hotelId={hotel!.id}
                    imageUrl={hotel!.images?.find((img) => img.room_id === room.id)?.url || getRoomPlaceholderImage(room.name) || hotel!.main_image}
                    onReservar={handleReservar}
                    onVerMas={handleVerMas}
                  />
                ))}
              </div>
              {rooms.length > 6 && (
                <div className="text-center mt-8">
                  <button
                    type="button"
                    onClick={() => navigate('/hoteles')}
                    className="inline-flex items-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors touch-manipulation"
                  >
                    Ver todas las habitaciones
                  </button>
                </div>
              )}
              {rooms.length > 0 && rooms.length <= 6 && (
                <div className="text-center mt-8">
                  <button
                    type="button"
                    onClick={() => navigate('/hoteles')}
                    className="inline-flex items-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors touch-manipulation"
                  >
                    Ver habitaciones y reservar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Features />
      <Gallery />
    </>
  );
}

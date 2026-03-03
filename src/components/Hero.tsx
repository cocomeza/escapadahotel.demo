import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Search } from 'lucide-react';
import { useState } from 'react';

interface HeroProps {
  onSearch?: () => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('huespedes', guests);
    navigate(`/hoteles?${params.toString()}`);
    onSearch?.();
  };

  return (
    <div className="relative min-h-[480px] sm:h-[520px] md:h-[580px] lg:h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      <div className="relative h-full flex flex-col justify-center items-center text-white px-3 sm:px-4 py-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-2 sm:mb-4">
          Hotel Escapada
        </h1>
        <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light italic text-center mb-6 sm:mb-10 md:mb-12">
          Tu lugar en la Provincia de Buenos Aires
        </p>

        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 sm:pr-3 md:pr-4">
              <Calendar className="w-5 h-5 text-cyan-500 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-gray-500 mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-gray-800 font-medium focus:outline-none bg-transparent text-sm sm:text-base min-h-[1.5rem]"
                  aria-label="Fecha de entrada"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 sm:pr-3 md:pr-4">
              <Calendar className="w-5 h-5 text-cyan-500 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-gray-500 mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-gray-800 font-medium focus:outline-none bg-transparent text-sm sm:text-base min-h-[1.5rem]"
                  aria-label="Fecha de salida"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-cyan-500 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-gray-500 mb-1">Huéspedes</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-gray-800 font-medium focus:outline-none bg-transparent text-sm sm:text-base"
                  aria-label="Cantidad de huéspedes"
                >
                  <option value="1">1 huésped</option>
                  <option value="2">2 huéspedes</option>
                  <option value="3">3 huéspedes</option>
                  <option value="4">4 huéspedes</option>
                  <option value="5">5 huéspedes</option>
                  <option value="6">6 o más</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="w-full mt-4 sm:mt-5 md:mt-6 bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 text-base touch-manipulation"
            aria-label="Ir a reservar"
          >
            <Search className="w-5 h-5 flex-shrink-0" />
            <span>Ver disponibilidad y reservar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

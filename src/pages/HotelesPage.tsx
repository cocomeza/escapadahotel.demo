import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import RoomCard from '../components/RoomCard';
import HotelCard from '../components/HotelCard';
import SearchFilters, { FilterState } from '../components/SearchFilters';
import { useHotels } from '../hooks/useHotels';
import { PRECIO_MAX_DEFAULT, getRoomPlaceholderImage } from '../lib/constants';

export default function HotelesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hotels, loading, error } = useHotels();
  const [reservations, setReservations] = useState<{ room_id: string | null }[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    location: searchParams.get('ubicacion') ?? '',
    minPrice: 0,
    maxPrice: PRECIO_MAX_DEFAULT,
    rating: 0,
  });
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const huespedes = searchParams.get('huespedes') ?? '';

  useEffect(() => {
    const ub = searchParams.get('ubicacion');
    if (ub) setFilters((f) => ({ ...f, location: ub }));
  }, [searchParams]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setReservations([]);
      return;
    }
    supabase
      .from('reservations')
      .select('room_id')
      .in('status', ['pending', 'confirmed'])
      .lte('check_in', checkOut)
      .gte('check_out', checkIn)
      .then(({ data }) => setReservations(data ?? []));
  }, [checkIn, checkOut]);

  const hotel = hotels[0] ?? null;
  const isSingleHotel = hotels.length === 1;
  const occupiedRoomIds = useMemo(() => new Set((reservations.map((r) => r.room_id).filter(Boolean) as string[])), [reservations]);

  const filteredRooms = useMemo(() => {
    if (!hotel?.rooms) return [];
    let list = hotel.rooms.filter((r) => {
      if (r.price_per_night < filters.minPrice) return false;
      if (filters.maxPrice > 0 && r.price_per_night > filters.maxPrice) return false;
      return true;
    });
    if (checkIn && checkOut && occupiedRoomIds.size > 0) {
      list = list.filter((r) => !occupiedRoomIds.has(r.id));
    }
    return list;
  }, [hotel?.rooms, filters.minPrice, filters.maxPrice, checkIn, checkOut, occupiedRoomIds]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (filters.location && h.location !== filters.location) return false;
      if (h.price_per_night < filters.minPrice) return false;
      if (filters.maxPrice > 0 && h.price_per_night > filters.maxPrice) return false;
      if (filters.rating > 0 && h.rating < filters.rating) return false;
      return true;
    });
  }, [hotels, filters]);

  const handleReservarRoom = (hotelId: string, roomId: string) => {
    const params = new URLSearchParams();
    params.set('roomId', roomId);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (huespedes) params.set('huespedes', huespedes);
    navigate(`/reservar/${hotelId}?${params.toString()}`);
  };

  const handleVerMasHotel = (hotelId: string) => {
    navigate(`/hoteles/${hotelId}`);
  };

  return (
    <div className="py-8 md:py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Habitaciones
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {checkIn && checkOut
              ? `Disponibles para ${checkIn} — ${checkOut}${huespedes ? ` · ${huespedes} huéspedes` : ''}`
              : 'Elegí la opción ideal para tu estadía en Hotel Escapada'}
          </p>
        </div>

        {isSingleHotel && hotel?.rooms && hotel.rooms.length > 0 && (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Filtrar por fechas</h3>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entrada</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      const v = e.target.value;
                      const p = new URLSearchParams(searchParams);
                      if (v) p.set('checkIn', v); else p.delete('checkIn');
                      navigate(`/hoteles?${p.toString()}`, { replace: true });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Salida</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => {
                      const v = e.target.value;
                      const p = new URLSearchParams(searchParams);
                      if (v) p.set('checkOut', v); else p.delete('checkOut');
                      navigate(`/hoteles?${p.toString()}`, { replace: true });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/hoteles')}
                  className="text-sm text-gray-500 hover:text-cyan-600"
                >
                  Limpiar fechas
                </button>
              </div>
            </div>
            <SearchFilters filters={filters} onFilterChange={setFilters} />
          </>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Error al cargar. Revisá tu conexión.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : isSingleHotel && hotel && hotel.rooms && hotel.rooms.length > 0 ? (
          filteredRooms.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">
                {checkIn && checkOut
                  ? 'No hay habitaciones disponibles para las fechas elegidas. Probá con otras fechas.'
                  : 'No hay habitaciones en ese rango de precio.'}
              </p>
              <button
                type="button"
                onClick={() => checkIn && checkOut ? navigate('/hoteles') : setFilters({ ...filters, minPrice: 0, maxPrice: PRECIO_MAX_DEFAULT })}
                className="mt-4 text-cyan-500 font-medium hover:underline touch-manipulation"
              >
                {checkIn && checkOut ? 'Cambiar fechas' : 'Limpiar filtros'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  hotelId={hotel.id}
                  imageUrl={hotel.images?.find((img) => img.room_id === room.id)?.url || getRoomPlaceholderImage(room.name) || hotel.main_image}
                  onReservar={handleReservarRoom}
                  onVerMas={handleVerMasHotel}
                />
              ))}
            </div>
          )
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">
              {hotels.length === 0
                ? 'Aún no hay hoteles ni habitaciones cargados. Entrá al panel de administración para crear el hotel y las habitaciones; después se verán aquí con sus imágenes.'
                : 'No hay habitaciones que coincidan con los filtros.'}
            </p>
            <button
              type="button"
              onClick={() => hotels.length === 0 ? navigate('/admin/login') : setFilters({ location: '', minPrice: 0, maxPrice: PRECIO_MAX_DEFAULT, rating: 0 })}
              className="mt-4 text-cyan-500 font-medium hover:underline touch-manipulation"
            >
              {hotels.length === 0 ? 'Ir al panel de administración' : 'Limpiar filtros'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((h) => (
              <HotelCard
                key={h.id}
                hotel={h}
                onSelect={(id) => navigate(`/hoteles/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

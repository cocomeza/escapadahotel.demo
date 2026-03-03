import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '../hooks/useHotels';
import HotelDetails from '../components/HotelDetails';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hotel, loading, error } = useHotel(id ?? '');

  if (!id) {
    navigate('/hoteles');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600 mb-4">No se encontró el alojamiento.</p>
        <button
          onClick={() => navigate('/hoteles')}
          className="text-cyan-500 font-medium hover:underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <HotelDetails
      hotel={hotel}
      onClose={() => navigate('/hoteles')}
      onReservar={() => navigate(`/reservar/${id}`)}
      onContactar={() => navigate('/contacto')}
    />
  );
}

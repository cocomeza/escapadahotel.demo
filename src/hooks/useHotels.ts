import { useEffect, useState } from 'react';
import { supabase, Hotel, HotelWithDetails, Amenity, Image, Room } from '../lib/supabase';

export function useHotels() {
  const [hotels, setHotels] = useState<HotelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const { data: hotelsData, error: hotelsError } = await supabase
          .from('hotels')
          .select('*')
          .order('created_at', { ascending: false });

        if (hotelsError) throw hotelsError;

        const hotelsWithDetails = await Promise.all(
          (hotelsData || []).map(async (hotel) => {
            const [amenitiesResult, imagesResult, roomsResult] = await Promise.all([
              supabase
                .from('hotel_amenities')
                .select('amenity_id, amenities(id, name, icon)')
                .eq('hotel_id', hotel.id),
              supabase
                .from('images')
                .select('*')
                .eq('hotel_id', hotel.id)
                .order('sort_order', { ascending: true }),
              supabase.from('rooms').select('*').eq('hotel_id', hotel.id),
            ]);

            const amenities = amenitiesResult.data?.map((ha: { amenities: Amenity }) => ha.amenities) || [];
            const images = imagesResult.data || [];
            const rooms = roomsResult.data || [];

            return {
              ...hotel,
              amenities,
              images,
              rooms,
            };
          })
        );

        setHotels(hotelsWithDetails);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, []);

  return { hotels, loading, error };
}

export function useHotel(id: string) {
  const [hotel, setHotel] = useState<HotelWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHotel() {
      try {
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (hotelError) throw hotelError;
        if (!hotelData) {
          setHotel(null);
          setLoading(false);
          return;
        }

        const [amenitiesResult, imagesResult, roomsResult] = await Promise.all([
          supabase
            .from('hotel_amenities')
            .select('amenity_id, amenities(id, name, icon)')
            .eq('hotel_id', id),
          supabase
            .from('images')
            .select('*')
            .eq('hotel_id', id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('rooms')
            .select('*')
            .eq('hotel_id', id)
        ]);

        const amenities = amenitiesResult.data?.map((ha: { amenities: Amenity }) => ha.amenities) || [];
        const images = imagesResult.data || [];
        const rooms = roomsResult.data || [];

        setHotel({
          ...hotelData,
          amenities,
          images,
          rooms
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchHotel();
    }
  }, [id]);

  return { hotel, loading, error };
}

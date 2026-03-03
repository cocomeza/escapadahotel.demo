import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Gallery from '../components/Gallery';

export default function GaleriaPage() {
  const [images, setImages] = useState<{ url: string; alt_text: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      const { data } = await supabase
        .from('images')
        .select('url, alt_text')
        .is('room_id', null)
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) {
        setImages(data);
      }
      setLoading(false);
    }
    fetchImages();
  }, []);

  return (
    <div className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Conocé las instalaciones del Hotel Escapada en la Provincia de Buenos Aires
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <Gallery images={images} />
        )}
      </div>
    </div>
  );
}

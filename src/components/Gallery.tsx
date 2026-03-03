const galleryImagesDefault = [
  { url: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg', alt_text: 'Piscina del hotel' },
  { url: 'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg', alt_text: 'Lobby elegante' },
  { url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg', alt_text: 'Habitación de lujo' },
  { url: 'https://images.pexels.com/photos/2506988/pexels-photo-2506988.jpeg', alt_text: 'Vista exterior' },
  { url: 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg', alt_text: 'Área de recreación' },
  { url: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg', alt_text: 'Suite presidencial' },
];

interface GalleryProps {
  images?: { url: string; alt_text: string }[];
}

export default function Gallery({ images }: GalleryProps) {
  const list = images && images.length > 0 ? images : galleryImagesDefault;
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Galería de imágenes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Conocé las instalaciones del Hotel Escapada
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {list.map((image, index) => (
            <div
              key={index}
              className="relative h-56 sm:h-64 overflow-hidden rounded-xl group cursor-pointer"
            >
              <img
                src={image.url}
                alt={image.alt_text}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-medium">{image.alt_text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

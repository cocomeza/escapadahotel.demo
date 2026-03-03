import { Waves, Sun, Wifi, Coffee, Sparkles, Utensils } from 'lucide-react';

const features = [
  {
    icon: Waves,
    title: 'Piscina',
    description: 'Disfruta de nuestra piscina climatizada con vista panorámica',
  },
  {
    icon: Sun,
    title: 'Solarium',
    description: 'Relájate en nuestro solarium exclusivo con tumbonas de lujo',
  },
  {
    icon: Wifi,
    title: 'WiFi Gratis',
    description: 'Conexión de alta velocidad en todas las instalaciones',
  },
  {
    icon: Coffee,
    title: 'Desayuno',
    description: 'Desayuno buffet incluido con productos locales',
  },
  {
    icon: Sparkles,
    title: 'Spa & Wellness',
    description: 'Centro de spa con tratamientos de relajación y belleza',
  },
  {
    icon: Utensils,
    title: 'Restaurant',
    description: 'Gastronomía de primera con chef especializado',
  },
];

export default function Features() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Servicios que podés encontrar
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            En Hotel Escapada vas a encontrar estos servicios para tu comodidad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="w-14 h-14 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors shrink-0">
                <feature.icon className="w-7 h-7 text-cyan-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

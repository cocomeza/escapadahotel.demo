import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Clock } from 'lucide-react';
import { HOTEL_ESCAPADA, CONTACTO_DEFAULT } from '../lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-white">Hotel </span>
                <span className="text-cyan-500">Escapada</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Tu lugar para descansar en la Provincia de Buenos Aires.
            </p>
            <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              Check-in {HOTEL_ESCAPADA.checkIn} · Check-out {HOTEL_ESCAPADA.checkOut}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Inicio</Link></li>
              <li><Link to="/hoteles" className="hover:text-cyan-500 transition-colors">Habitaciones</Link></li>
              <li><Link to="/galeria" className="hover:text-cyan-500 transition-colors">Galería</Link></li>
              <li><Link to="/reservar" className="hover:text-cyan-500 transition-colors">Reservar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Información</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/contacto" className="hover:text-cyan-500 transition-colors">Contacto</Link></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                <span>{CONTACTO_DEFAULT.ubicacion}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden />
                <a href="tel:+5491112345678" className="hover:text-cyan-500 transition-colors">{CONTACTO_DEFAULT.telefono}</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden />
                <a href="mailto:info@hotelescapada.com.ar" className="hover:text-cyan-500 transition-colors">{CONTACTO_DEFAULT.email}</a>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-cyan-500 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-cyan-500 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-cyan-500 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Hotel Escapada. Provincia de Buenos Aires, Argentina.</p>
        </div>
      </div>
    </footer>
  );
}

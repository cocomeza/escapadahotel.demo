import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/hoteles', label: 'Habitaciones' },
    { to: '/galeria', label: 'Galería' },
    { to: '/contacto', label: 'Contacto' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gray-800">Hotel </span>
              <span className="text-cyan-500">Escapada</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-gray-600 hover:text-cyan-500 font-medium transition-colors text-sm"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-cyan-500 transition-colors"
                >
                  Panel Admin
                </Link>
                <button
                  onClick={() => signOut().then(() => navigate('/'))}
                  className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/iniciar-sesion"
                  className="text-sm font-medium text-gray-600 hover:text-cyan-500 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/admin/login"
                  className="text-sm font-medium text-gray-600 hover:text-cyan-500 transition-colors"
                >
                  Admin
                </Link>
              </>
            )}
            <Link
              to="/reservar"
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2.5 rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
            >
              <Search className="w-4 h-4" />
              Reservar
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="py-2 text-gray-700 hover:text-cyan-500 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    to="/iniciar-sesion"
                    className="py-2 text-gray-700 hover:text-cyan-500 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión (huésped)
                  </Link>
                  <Link
                    to="/admin/login"
                    className="py-2 text-gray-700 hover:text-cyan-500 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link to="/admin/dashboard" className="py-2 text-gray-700 hover:text-cyan-500 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Panel Admin
                  </Link>
                  <button
                    onClick={() => { signOut(); setIsMenuOpen(false); navigate('/'); }}
                    className="py-2 text-left text-gray-700 hover:text-red-500 font-medium"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
              <Link
                to="/reservar"
                className="flex items-center justify-center gap-2 bg-cyan-500 text-white py-3 rounded-lg font-medium mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Reservar
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

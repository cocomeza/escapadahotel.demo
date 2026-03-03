import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function GuestAuthPage() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message || 'Error al iniciar sesión. Revisá correo y contraseña.');
      return;
    }
    navigate(returnTo, { replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signUp(email, password, { displayName: displayName || undefined });
    setLoading(false);
    if (err) {
      setError(err.message || 'Error al registrarse. El correo puede estar en uso.');
      return;
    }
    setRegisterSuccess(true);
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Cuenta creada</h2>
          <p className="text-gray-600 text-sm mb-6">
            Revisá tu correo para confirmar la cuenta. Luego iniciá sesión para confirmar tu reserva.
          </p>
          <button
            type="button"
            onClick={() => { setRegisterSuccess(false); setTab('login'); }}
            className="w-full bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">
          {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          {tab === 'login' ? 'Para confirmar tu reserva' : 'Registrate para poder confirmar tu reserva'}
        </p>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${tab === 'login' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-gray-500'}`}
          >
            <LogIn className="w-4 h-4" /> Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${tab === 'register' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-gray-500'}`}
          >
            <UserPlus className="w-4 h-4" /> Registrarse
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to={returnTo} className="text-cyan-600 hover:underline">Volver</Link>
        </p>
      </div>
    </div>
  );
}

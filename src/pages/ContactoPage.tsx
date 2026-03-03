import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { CONTACTO_DEFAULT } from '../lib/constants';

export default function ContactoPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="py-8 sm:py-12 md:py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Contacto
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Escribinos desde cualquier lugar. Te respondemos a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8">
            {sent ? (
              <div className="text-center py-8">
                <p className="text-cyan-600 font-medium mb-2">Mensaje enviado correctamente.</p>
                <p className="text-gray-500 text-sm">Te contactaremos pronto.</p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 text-cyan-500 font-medium hover:underline touch-manipulation"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
                    placeholder="Contanos en qué podemos ayudarte..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors touch-manipulation"
                >
                  <Send className="w-5 h-5 flex-shrink-0" />
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <h3 className="font-bold text-gray-800 mb-4">Datos de contacto</h3>
              <ul className="space-y-4 text-gray-600 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" aria-hidden />
                  <span>{CONTACTO_DEFAULT.ubicacion}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-500 flex-shrink-0" aria-hidden />
                  <a href={`tel:${CONTACTO_DEFAULT.telefono.replace(/\s/g, '')}`} className="hover:text-cyan-600">
                    {CONTACTO_DEFAULT.telefono}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-cyan-500 flex-shrink-0" aria-hidden />
                  <a href={`mailto:${CONTACTO_DEFAULT.email}`} className="hover:text-cyan-600">
                    {CONTACTO_DEFAULT.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

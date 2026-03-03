// Ubicaciones típicas de Provincia de Buenos Aires, Argentina
export const LOCACIONES_BSAS = [
  'Mar del Plata',
  'Pinamar',
  'Villa Gesell',
  'Miramar',
  'Necochea',
  'Cariló',
  'San Clemente del Tuyú',
  'Santa Teresita',
  'Tandil',
  'Sierra de la Ventana',
  'Punta Indio',
  'La Plata',
  'Tigre',
  'San Isidro',
  'Otro',
] as const;

export type LocacionBsAs = (typeof LOCACIONES_BSAS)[number];

export const LOCACIONES_OPCIONES = [
  { value: '', label: 'Todas las ubicaciones' },
  ...LOCACIONES_BSAS.filter((l) => l !== 'Otro').map((l) => ({ value: l, label: l })),
];

// Moneda Argentina
export const MONEDA = 'ARS';
export const MONEDA_SIMBOLO = '$';
export const MONEDA_LABEL = 'pesos';

// Formato de precio para mostrar (Argentina)
export function formatearPrecio(value: number): string {
  return `${MONEDA_SIMBOLO}${value.toLocaleString('es-AR')}`;
}

// Precio máximo por defecto en filtros (pesos)
export const PRECIO_MAX_DEFAULT = 500000;

// Contacto por defecto (Provincia de Buenos Aires)
export const CONTACTO_DEFAULT = {
  ubicacion: 'Provincia de Buenos Aires, Argentina',
  telefono: '+54 9 11 1234-5678',
  email: 'info@hotelescapada.com.ar',
};

// Hotel Escapada – textos y datos para la web del hotel
// Horarios: en Argentina/Pcia. Bs As lo habitual es check-in 14:00–16:00 (muy común 15:00) y check-out 11:00 o 12:00. Ajustá según tu establecimiento.
export const HOTEL_ESCAPADA = {
  nombre: 'Hotel Escapada',
  bienvenida: 'En Hotel Escapada te esperamos para que disfrutes de una estadía tranquila en la Provincia de Buenos Aires. Contamos con habitaciones cómodas, servicios pensados para vos y la mejor atención.',
  checkIn: '15:00',
  checkOut: '11:00',
};

// Forma de pago: sin pasarela; contacto por WhatsApp y pago en el hotel
export const INFO_PAGO = {
  titulo: 'Forma de pago',
  descripcion: 'No utilizamos pasarela de pago online. Una vez confirmada tu reserva, podés abonar por transferencia bancaria vía WhatsApp o en efectivo/débito al llegar al hotel.',
  contactoWhatsApp: CONTACTO_DEFAULT.telefono,
};

const ROOM_IMAGES: { keyword: string[]; url: string }[] = [
  { keyword: ['suite'], url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
  { keyword: ['doble', 'matrimonial', 'matrimonio'], url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' },
  { keyword: ['simple', 'single', 'individual', 'sencilla'], url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800' },
  { keyword: ['familiar', 'familia', 'cuadruple'], url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' },
  { keyword: ['triple'], url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800' },
  { keyword: ['cabana', 'cabaña'], url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800' },
];

export function getRoomPlaceholderImage(roomName: string): string {
  const name = roomName.toLowerCase().trim();
  for (const { keyword, url } of ROOM_IMAGES) {
    if (keyword.some((k) => name.includes(k))) return url;
  }
  return 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800';
}

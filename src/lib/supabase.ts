import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  price_per_night: number;
  main_image: string;
  created_at: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  size_sqm: number;
  created_at: string;
  status_override?: 'cleaning' | 'maintenance' | null;
  cleaned_at?: string | null;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface Image {
  id: string;
  hotel_id: string | null;
  room_id: string | null;
  url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  hotel_id: string;
  room_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  special_requests?: string | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationCharge {
  id: string;
  reservation_id: string;
  description: string;
  amount: number;
  charge_type: 'room' | 'minibar' | 'breakfast' | 'other';
  created_at: string;
}

export interface ReservationPayment {
  id: string;
  reservation_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'other';
  reference: string | null;
  created_at: string;
}

export interface CleaningAssignment {
  id: string;
  room_id: string;
  assignment_date: string;
  staff_name: string;
  status: 'pending' | 'in_progress' | 'done';
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface HotelWithDetails extends Hotel {
  amenities?: Amenity[];
  images?: Image[];
  rooms?: Room[];
}

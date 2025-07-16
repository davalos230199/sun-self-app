import { createClient } from '@supabase/supabase-js';

// Leemos las variables de entorno públicas que configuraste en Render.
// El prefijo VITE_ es importante para que Vite las incluya en el frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos y exportamos el cliente de Supabase para que otros archivos puedan usarlo.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

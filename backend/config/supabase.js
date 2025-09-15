// Archivo: backend/config/supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error fatal: Las variables de entorno de Supabase (SUPABASE_URL, SUPABASE_ANON_KEY) no están definidas en tu archivo .env");
    process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
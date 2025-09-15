// Archivo: backend/config/supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// ¡LA LLAVE MAESTRA! Usamos la Service Key para que el backend tenga acceso total.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error fatal: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY en el archivo .env del backend.");
    process.exit(1);
}

// Creamos el cliente con los privilegios de administrador.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
// backend/routes/registros.js

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth'); // Importamos el guardia de seguridad

// Necesitamos inicializar Supabase aquí también
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TODAS LAS RUTAS DE ESTE ARCHIVO YA ESTÁN PROTEGIDAS ---
// Usamos el middleware a nivel del router para no repetirlo en cada ruta.
router.use(authMiddleware);

// RUTA PARA CREAR UN REGISTRO -> POST /api/registros
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { mente, emocion, cuerpo } = req.body;

    if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
      return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
    }

    const { data, error } = await supabase
    .from('registros')
    .insert([{
      user_id: userId,
      mente_estat: mente.seleccion,
      mente_coment: mente.comentario,
      emocion_estat: emocion.seleccion,
      emocion_coment: emocion.comentario,
      cuerpo_estat: cuerpo.seleccion,
      cuerpo_coment: cuerpo.comentario,
    }]).select(); // <-- ¡AQUÍ ESTÁ EL CAMBIO! -- AÑADE EL ULTIMO REGISTRO CREADO EN EL MENU INICIAL

    if (error) throw error;
    res.status(201).json({ message: 'Registro guardado con éxito', registro: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el registro' });
  }
});

// RUTA PARA OBTENER TODO EL HISTORIAL -> GET /api/registros
router.get('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error en GET /api/registros:", err);
    res.status(500).json({ error: 'Error al obtener los registros' });
  }
});

// RUTA PARA VERIFICAR SI HAY REGISTRO HOY -> GET /api/registros/today
router.get('/today', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      // CLAVE: Ordenamos por fecha de creación DESCENDENTE antes de limitar a 1.
      // Esto nos asegura que siempre obtendremos el registro MÁS RECIENTE del día.
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    res.json({ registro: data.length > 0 ? data[0] : null });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar el registro de hoy' });
  }
});

module.exports = router;

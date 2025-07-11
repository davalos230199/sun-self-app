// backend/routes/registros.js

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// La ruta POST para crear no cambia.
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { mente, emocion, cuerpo } = req.body;
    if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
      return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
    }
    const { data, error } = await supabase.from('registros').insert([{ user_id: userId, mente_estat: mente.seleccion, mente_coment: mente.comentario, emocion_estat: emocion.seleccion, emocion_coment: emocion.comentario, cuerpo_estat: cuerpo.seleccion, cuerpo_coment: cuerpo.comentario, }]).select();
    if (error) throw error;
    res.status(201).json({ message: 'Registro guardado con éxito', registro: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el registro' });
  }
});

// La ruta GET para el historial no cambia.
router.get('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { data, error } = await supabase.from('registros').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error en GET /api/registros:", err);
    res.status(500).json({ error: 'Error al obtener los registros' });
  }
});

// La ruta GET para el registro de hoy no cambia.
router.get('/today', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.from('registros').select('*').eq('user_id', userId).gte('created_at', `${today}T00:00:00.000Z`).lte('created_at', `${today}T23:59:59.999Z`).order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    res.json({ registro: data.length > 0 ? data[0] : null });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar el registro de hoy' });
  }
});


// --- NUEVO ENDPOINT PARA "LA HOJA DE ATRÁS" ---
// Usamos PUT para actualizar un registro existente.
router.put('/:id/hoja_atras', async (req, res) => {
  try {
    const { id: recordId } = req.params; // El ID del registro viene de la URL
    const { id: userId } = req.user;     // El ID del usuario viene del token
    const { texto } = req.body;          // El texto del diario viene del cuerpo de la petición

    if (typeof texto === 'undefined') {
      return res.status(400).json({ error: 'El campo "texto" es requerido.' });
    }

    // Actualizamos la columna 'hoja_atras' en la tabla 'registros'.
    // IMPORTANTE: Añadimos una doble comprobación de seguridad:
    // 1. Que el ID del registro coincida.
    // 2. Que el user_id del registro coincida con el del usuario autenticado.
    // Esto evita que un usuario pueda modificar el diario de otro.
    const { data, error } = await supabase
      .from('registros')
      .update({ hoja_atras: texto })
      .eq('id', recordId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    // Si la actualización no encontró ninguna fila (porque el ID era incorrecto o no pertenecía al usuario),
    // data estará vacío.
    if (data.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado o no tienes permiso para modificarlo.' });
    }

    res.status(200).json({ message: 'Hoja de atrás guardada con éxito.', registro: data[0] });

  } catch (err) {
    console.error("Error en PUT /:id/hoja_atras:", err);
    res.status(500).json({ error: 'Error interno al guardar la entrada del diario.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id: recordId } = req.params;
    const { id: userId } = req.user;

    // Buscamos el registro que coincida con el ID y que pertenezca al usuario.
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single(); // .single() espera un solo resultado o devuelve un error.

    if (error) {
      if (error.code === 'PGRST116') { // Código de Supabase para "no rows found"
        return res.status(404).json({ error: 'Registro no encontrado.' });
      }
      throw error;
    }
    
    res.status(200).json(data);

  } catch (err) {
    console.error("Error en GET /:id :", err);
    res.status(500).json({ error: 'Error interno al obtener el registro.' });
  }
});

module.exports = router;

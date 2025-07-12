// backend/routes/registros.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// RUTA PARA CREAR UN REGISTRO
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { mente, emocion, cuerpo, meta_del_dia } = req.body;
    if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
      return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
    }
    const valores = [mente.seleccion, emocion.seleccion, cuerpo.seleccion];
    const puntaje = valores.reduce((acc, val) => {
      if (val === 'alto') return acc + 1;
      if (val === 'bajo') return acc - 1;
      return acc;
    }, 0);
    let estado_general;
    if (puntaje >= 2) { estado_general = 'soleado'; } 
    else if (puntaje <= -2) { estado_general = 'lluvioso'; } 
    else { estado_general = 'nublado'; }
    const { data, error } = await supabase.from('registros').insert([{ user_id: userId, mente_estat: mente.seleccion, mente_coment: mente.comentario, emocion_estat: emocion.seleccion, emocion_coment: emocion.comentario, cuerpo_estat: cuerpo.seleccion, cuerpo_coment: cuerpo.comentario, estado_general: estado_general, meta_del_dia: meta_del_dia }]).select();
    if (error) throw error;
    res.status(201).json({ message: 'Registro guardado con éxito', registro: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el registro' });
  }
});

// RUTA GET PARA EL HISTORIAL
router.get('/', async (req, res) => { /* ... (sin cambios) ... */ });

// RUTA GET PARA EL REGISTRO DE HOY (¡AQUÍ ESTÁ EL ARREGLO!)
router.get('/today', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // 1. Obtenemos el desfase horario del cliente desde las cabeceras.
    const timezoneOffset = parseInt(req.headers['x-timezone-offset'] || '0', 10);

    // 2. Calculamos la fecha y hora actual del cliente.
    const now = new Date();
    const clientNow = new Date(now.getTime() - timezoneOffset * 60 * 1000);
    
    // 3. Obtenemos la fecha en formato YYYY-MM-DD según el cliente.
    const clientToday = clientNow.toISOString().slice(0, 10);

    // 4. Usamos la fecha del cliente para la consulta.
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${clientToday}T00:00:00.000Z`)
      .lte('created_at', `${clientToday}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    res.json({ registro: data.length > 0 ? data[0] : null });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar el registro de hoy' });
  }
});

// RUTA PUT PARA "LA HOJA DE ATRÁS"
router.put('/:id/hoja_atras', async (req, res) => { /* ... (sin cambios) ... */ });

// RUTA GET PARA UN SOLO REGISTRO
router.get('/:id', async (req, res) => { /* ... (sin cambios) ... */ });

module.exports = router;

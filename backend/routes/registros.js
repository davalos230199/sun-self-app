const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// --- CAMBIO: NUEVA RUTA PARA LOS DATOS DEL GRÁFICO ---
// GET /api/registros/chart-data?filter=mensual
router.get('/chart-data', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { filter } = req.query; // 'semanal', 'mensual', etc.

        let query = supabase
            .from('registros')
            .select('created_at, estado_general')
            .eq('user_id', userId);

        // Aplicamos el filtro de fecha si se proporciona
        if (filter === 'semanal') {
            const unaSemanaAtras = new Date();
            unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
            query = query.gte('created_at', unaSemanaAtras.toISOString());
        } else if (filter === 'mensual') {
            const unMesAtras = new Date();
            unMesAtras.setMonth(unMesAtras.getMonth() - 1);
            query = query.gte('created_at', unMesAtras.toISOString());
        }
        // Se pueden añadir más filtros como 'anual' en el futuro

        const { data, error } = await query.order('created_at', { ascending: true });

        if (error) throw error;

        // Mapeamos los datos al formato que necesita el gráfico con los nuevos valores
        const chartData = data.map(registro => {
            let valor;
            switch (registro.estado_general) {
                case 'soleado': valor = 4; break;
                case 'nublado': valor = 3; break;
                case 'lluvioso': valor = 2; break;
                default: valor = 3; // Un valor neutral por si acaso
            }
            return {
                fecha: new Date(registro.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                valor: valor
            };
        });

        res.json(chartData);

    } catch (err) {
        console.error("Error en GET /chart-data:", err);
        res.status(500).json({ error: 'Error al obtener los datos para el gráfico.' });
    }
});


// --- RUTAS EXISTENTES (sin cambios) ---

// RUTA PARA CREAR UN REGISTRO
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { mente, emocion, cuerpo, meta_del_dia, compartir_anonimo } = req.body;
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
    const { data, error } = await supabase.from('registros').insert([{ user_id: userId, mente_estat: mente.seleccion, mente_coment: mente.comentario, emocion_estat: emocion.seleccion, emocion_coment: emocion.comentario, cuerpo_estat: cuerpo.seleccion, cuerpo_coment: cuerpo.comentario, estado_general: estado_general, meta_del_dia: meta_del_dia, compartir_anonimo: !!compartir_anonimo  }]).select();
    if (error) throw error;
    res.status(201).json({ message: 'Registro guardado con éxito', registro: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el registro' });
  }
});

// RUTA GET PARA EL HISTORIAL
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

// RUTA GET PARA EL REGISTRO DE HOY
router.get('/today', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
    const { data, error } = await supabase
      .rpc('get_today_record_for_user', {
        user_id_param: userId,
        client_timezone: clientTimezone
      });
    if (error) throw error;
    res.json({ registro: data.length > 0 ? data[0] : null });
  } catch (err) {
    console.error("Error en GET /today con RPC:", err);
    res.status(500).json({ error: 'Error al verificar el registro de hoy' });
  }
});

// RUTA PUT PARA "LA HOJA DE ATRÁS"
router.put('/:id/hoja_atras', async (req, res) => {
  try {
    const { id: recordId } = req.params;
    const { id: userId } = req.user;
    const { texto } = req.body;
    if (typeof texto === 'undefined') {
      return res.status(400).json({ error: 'El campo "texto" es requerido.' });
    }
    const { data, error } = await supabase.from('registros').update({ hoja_atras: texto }).eq('id', recordId).eq('user_id', userId).select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado o no tienes permiso para modificarlo.' });
    }
    res.status(200).json({ message: 'Hoja de atrás guardada con éxito.', registro: data[0] });
  } catch (err) {
    console.error("Error en PUT /:id/hoja_atras:", err);
    res.status(500).json({ error: 'Error interno al guardar la entrada del diario.' });
  }
});

// RUTA GET PARA UN SOLO REGISTRO
router.get('/:id', async (req, res) => {
  try {
    const { id: recordId } = req.params;
    const { id: userId } = req.user;
    const { data, error } = await supabase.from('registros').select('*').eq('id', recordId).eq('user_id', userId).single();
    if (error) {
      if (error.code === 'PGRST116') {
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

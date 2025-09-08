const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// ▼▼▼ ESTA ES LA RUTA CORREGIDA ▼▼▼
router.get('/chart-data', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { filter } = req.query;

        // 1. Llamamos a nuestra función de Supabase
        const { data, error } = await supabase.rpc('get_chart_data_for_user', {
            p_user_id: userId,
            p_filter_period: filter
        });

        if (error) throw error;

        // 2. Enviamos los datos DIRECTAMENTE como vienen. Sin re-procesar.
        res.json(data);

    } catch (err) {
        console.error("Error en GET /chart-data:", err);
        res.status(500).json({ error: 'Error al obtener los datos para el gráfico.' });
    }
});

// --- EL RESTO DEL ARCHIVO SE MANTIENE EXACTAMENTE IGUAL ---
// RUTA PARA CREAR UN REGISTRO
router.post('/', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { mente, emocion, cuerpo, meta_del_dia, compartir_anonimo, minimetas } = req.body;
        
        if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
            return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
        }
        
        const valores = [mente.seleccion, emocion.seleccion, cuerpo.seleccion];
        const puntaje = valores.reduce((acc, val) => val === 'alto' ? acc + 1 : val === 'bajo' ? acc - 1 : acc, 0);
        let estado_general = 'nublado';
        if (puntaje >= 2) estado_general = 'soleado';
        if (puntaje <= -2) estado_general = 'lluvioso';

        const { data: registroData, error: registroError } = await supabase.rpc('create_registro', {
            p_user_id: userId,
            p_mente_estat: mente.seleccion,
            p_mente_coment: mente.comentario,
            p_emocion_estat: emocion.seleccion,
            p_emocion_coment: emocion.comentario,
            p_cuerpo_estat: cuerpo.seleccion,
            p_cuerpo_coment: cuerpo.comentario,
            p_estado_general: estado_general,
            p_meta_del_dia: meta_del_dia,
            p_compartir_anonimo: true
        });

        if (registroError) throw registroError;

        if (minimetas && minimetas.length > 0 && registroData.id) {
            const minimetasParaInsertar = minimetas.map(desc => ({
                descripcion: desc,
                user_id: userId,
                registro_id: registroData.id
            }));
            await supabase.from('mini_metas').insert(minimetasParaInsertar);
        }

        res.status(201).json({ message: 'Registro guardado con éxito', registro: registroData });
    } catch (err) {
        console.error("Error al crear registro:", err);
        res.status(500).json({ error: 'Error al guardar el registro.' });
    }
});

// RUTA GET PARA TODO EL HISTORIAL
router.get('/', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { data, error } = await supabase.rpc('get_registros_for_user', { p_user_id: userId });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error("Error en GET /api/registros:", err);
        res.status(500).json({ error: 'Error al obtener los registros' });
    }
});

// RUTA GET PARA EL REGISTRO DE HOY
// RUTA GET PARA EL REGISTRO DE HOY (OPTIMIZADA)
router.get('/today', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        
        // CAMBIO: Llamamos a nuestra nueva función "francotirador"
        const { data, error } = await supabase.rpc('get_registro_de_hoy', {
            p_user_id: userId,
            p_client_timezone: clientTimezone
        });

        if (error) throw error;

        // La función devuelve el registro encontrado o un array vacío.
        // Tomamos el primer elemento (el único) o devolvemos null si no hay nada.
        const registroDeHoy = data && data.length > 0 ? data[0] : null;

        res.json({ registro: registroDeHoy });

    } catch (err) {
        console.error("Error en GET /today:", err);
        res.status(500).json({ error: 'Error al verificar el registro de hoy.' });
    }
});

// RUTA GET PARA UN SOLO REGISTRO
router.get('/:id', async (req, res) => {
    try {
        const { id: recordId } = req.params;
        const { id: userId } = req.user;
        
        const { data, error } = await supabase.rpc('get_registro_by_id', {
            p_user_id: userId,
            p_registro_id: Number(recordId)
        });

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Registro no encontrado.' });
        }
        
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en GET /registros/:id :", err);
        res.status(500).json({ error: 'Error interno al obtener el registro.' });
    }
});

// RUTA PUT PARA "LA HOJA DE ATRÁS"
router.put('/:id/hoja_atras', async (req, res) => {
    try {
        const { id: recordId } = req.params;
        const { id: userId } = req.user;
        const { texto } = req.body;
        
        const { data, error } = await supabase.rpc('update_hoja_atras', {
            p_user_id: userId,
            p_registro_id: Number(recordId),
            p_texto: texto
        });

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Registro no encontrado o sin permiso.' });
        
        res.status(200).json({ message: 'Hoja de atrás guardada con éxito.', registro: data });
    } catch (err) {
        console.error("Error en PUT /:id/hoja_atras:", err);
        res.status(500).json({ error: 'Error interno al guardar la entrada.' });
    }
});

module.exports = router;
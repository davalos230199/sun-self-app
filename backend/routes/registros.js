const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// RUTA PARA OBTENER LOS DATOS DEL GRÁFICO
router.get('/chart-data', async (req, res) => {
    try {
        const { id: userId } = req.user; // Este ID ahora es UUID
        const { filter } = req.query;

        const { data, error } = await supabase.rpc('get_chart_data_for_user', {
            p_user_id: userId,
            p_filter_period: filter
        });

        if (error) throw error;

        const chartData = data.map(registro => {
            let valor;
            switch (registro.estado_general_text) {
                case 'soleado': valor = 4; break;
                case 'nublado': valor = 3; break;
                case 'lluvioso': valor = 2; break;
                default: valor = 3;
            }
            return {
                fecha: new Date(registro.created_at_ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                valor: valor
            };
        });
        res.json(chartData);
    } catch (err) {
        console.error("Error en GET /chart-data:", err);
        res.status(500).json({ error: 'Error al obtener los datos para el gráfico.' });
    }
});

// RUTA PARA CREAR UN REGISTRO
router.post('/', async (req, res) => {
    try {
        const { id: userId } = req.user; // Este ID ahora es UUID
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
            p_compartir_anonimo: !!compartir_anonimo
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
        const { id: userId } = req.user; // Este ID ahora es UUID
        const { data, error } = await supabase.rpc('get_registros_for_user', { p_user_id: userId });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error("Error en GET /api/registros:", err);
        res.status(500).json({ error: 'Error al obtener los registros' });
    }
});

// RUTA GET PARA EL REGISTRO DE HOY
router.get('/today', async (req, res) => {
    try {
        const { id: userId } = req.user; // Este ID ahora es UUID
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        
        const { data: todosLosRegistros, error } = await supabase.rpc('get_registros_for_user', { p_user_id: userId });

        if (error) throw error;

        const registros = todosLosRegistros || [];

        const registroDeHoy = registros.find(registro => {
            const registroDate = new Date(registro.created_at);
            const hoyLocale = new Date().toLocaleDateString('en-CA', { timeZone: clientTimezone });
            const registroDateLocale = registroDate.toLocaleDateString('en-CA', { timeZone: clientTimezone });
            return hoyLocale === registroDateLocale;
        }) || null;

        res.json({ registro: registroDeHoy });
    } catch (err) {
        console.error("Error en GET /today:", err);
        res.status(500).json({ error: 'Error al verificar el registro de hoy.' });
    }
});

module.exports = router;

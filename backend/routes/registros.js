const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// RUTA PARA OBTENER LOS DATOS DEL GRÁFICO (Corregida)
router.get('/chart-data', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { filter } = req.query;

        const { data, error } = await supabase
            .rpc('get_chart_data_for_user', {
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

// RUTA PARA CREAR UN REGISTRO (Corregida para RLS)
router.post('/', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { mente, emocion, cuerpo, meta_del_dia, compartir_anonimo, minimetas } = req.body;
        
        if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
            return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
        }
        
        // Lógica de puntaje
        const valores = [mente.seleccion, emocion.seleccion, cuerpo.seleccion];
        const puntaje = valores.reduce((acc, val) => val === 'alto' ? acc + 1 : val === 'bajo' ? acc - 1 : acc, 0);
        let estado_general = 'nublado';
        if (puntaje >= 2) estado_general = 'soleado';
        if (puntaje <= -2) estado_general = 'lluvioso';

        // El INSERT funciona porque la política de 'registros' valida que el user_id que insertamos
        // coincida con el usuario autenticado (auth.uid). Aquí usamos la conversión a texto.
        const { data: registroData, error: registroError } = await supabase
            .from('registros')
            .insert([{ user_id: userId, /*... otros campos ...*/ }])
            .select()
            .single();

        if (registroError) throw registroError;

        if (minimetas && minimetas.length > 0) {
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


// RUTA GET PARA TODO EL HISTORIAL (Corregida)
router.get('/', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { data, error } = await supabase.rpc('get_registros_for_user', { p_user_id: userId });
        if (error) throw error;
        // La RPC devuelve un array dentro de un JSON, o null si no hay datos.
        res.json(data || []);
    } catch (err) {
        console.error("Error en GET /api/registros:", err);
        res.status(500).json({ error: 'Error al obtener los registros' });
    }
});

// RUTA GET PARA EL REGISTRO DE HOY (Corregida y Simplificada)
router.get('/today', async (req, res) => {
    try {
        const { id: userId } = req.user;
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

// RUTA PUT PARA "LA HOJA DE ATRÁS" (Corregida)
router.put('/:id/hoja_atras', async (req, res) => {
    try {
        const { id: recordId } = req.params;
        const { id: userId } = req.user;
        const { texto } = req.body;
        
        const { data, error } = await supabase.rpc('update_hoja_atras', {
            p_user_id: userId,
            p_record_id: recordId,
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

// RUTA GET PARA UN SOLO REGISTRO (Corregida)
router.get('/:id', async (req, res) => {
    try {
        const { id: recordId } = req.params;
        const { id: userId } = req.user;
        
        const { data, error } = await supabase.rpc('get_registro_by_id', {
            p_user_id: userId,
            p_record_id: recordId
        });

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
        
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en GET /:id :", err);
        res.status(500).json({ error: 'Error interno al obtener el registro.' });
    }
});

module.exports = router;
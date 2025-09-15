const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');
const { OpenAI } = require('openai');
const { PERSONALIDAD_SUNNY, construirPromptDeRegistro } = require('../config/prompts.js');


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,});


router.use(authMiddleware);

// --- RUTAS GET (ORDEN CORREGIDO) ---

router.get('/chart-data', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { filter } = req.query;
        const { data, error } = await supabase.rpc('get_chart_data_for_user', {
            p_user_id: userId,
            p_filter_period: filter
        });

        if (error) throw error;
        res.json(data);

    } catch (err) {
        console.error("Error en GET /chart-data:", err);
        res.status(500).json({ error: 'Error al obtener los datos para el gráfico.' });
    }
});

router.get('/today', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        const { data, error } = await supabase.rpc('get_registro_de_hoy', {
            p_user_id: userId,
            p_client_timezone: clientTimezone
        });

        if (error) throw error;
        const registroDeHoy = data && data.length > 0 ? data[0] : null;

        res.json({ registro: registroDeHoy });

    } catch (err) {
        console.error("Error en GET /today:", err);
        res.status(500).json({ error: 'Error al verificar el registro de hoy.' });
    }
});

router.get('/fecha/:fecha', async (req, res) => {
    try {
        const { fecha } = req.params; // ej: "2025-09-10"
        const { id: userId } = req.user;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({ error: 'Formato de fecha inválido. Usar YYYY-MM-DD.' });
        }

        const { data, error } = await supabase.rpc('get_registro_by_fecha', {
            p_user_id: userId,
            p_fecha: fecha
        });

        if (error) {
            throw error;
        }

        const registro = data && data.length > 0 ? data[0] : null;

        if (!registro) {
            return res.status(404).json({ message: 'No se encontró un registro para la fecha especificada.' });
        }

        res.status(200).json({ registro });

    } catch (err) {
        console.error("Error en GET /registros/fecha/:fecha :", err);
        res.status(500).json({ error: 'Error interno al obtener el registro.' });
    }
});

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


// --- RUTAS POST Y PUT ---

router.post('/', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { mente_estado, mente_descripcion, emocion_estado, emocion_descripcion, cuerpo_estado, cuerpo_descripcion, meta_descripcion } = req.body;

        const menteNum = parseInt(mente_estado, 10);
        const emocionNum = parseInt(emocion_estado, 10);
        const cuerpoNum = parseInt(cuerpo_estado, 10);

        if (isNaN(menteNum) || isNaN(emocionNum) || isNaN(cuerpoNum)) {
            return res.status(400).json({ error: 'Los valores de estado deben ser números válidos.' });
        }

        const avg = (menteNum + emocionNum + cuerpoNum) / 3;
        let estado_general = 'nublado';
        if (avg > 66) estado_general = 'soleado';
        if (avg < 33) estado_general = 'lluvioso';

        const { data: nuevoRegistro, error: registroError } = await supabase
            .from('registros')
            .insert({
                user_id: userId,
                mente_estat: menteNum,
                mente_coment: mente_descripcion,
                emocion_estat: emocionNum,
                emocion_coment: emocion_descripcion,
                cuerpo_estat: cuerpoNum,
                cuerpo_coment: cuerpo_descripcion,
                meta_del_dia: meta_descripcion,
                compartir_anonimo: true,
                estado_general: estado_general
            })
            .select()
            .single();

        if (registroError) throw registroError;

        const promptDeTarea = construirPromptDeRegistro(nuevoRegistro);

        // --- INICIO DE LA CORRECCIÓN ---
        // Aquí restauramos los parámetros que OpenAI necesita
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: promptDeTarea }
            ],
            max_tokens: 60,
        });
        // --- FIN DE LA CORRECCIÓN ---

        const fraseGenerada = completion.choices[0].message.content.trim();

        const { data: registroActualizado, error: updateError } = await supabase
            .from('registros')
            .update({ frase_sunny: fraseGenerada })
            .eq('id', nuevoRegistro.id)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        res.status(201).json(registroActualizado);

    } catch (err) {
        console.error("Error al crear el registro y la frase de Sunny:", err);
        res.status(500).json({ error: 'Error en el servidor al procesar el registro.' });
    }
});

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
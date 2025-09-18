// backend/routes/registros.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { OpenAI } = require('openai');
const { PERSONALIDAD_SUNNY, construirPromptDeRegistro } = require('../config/prompts.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.use(authMiddleware);

// --- RUTAS REESCRITAS PARA USAR QUERIES DIRECTAS ---

// GET /today - REESCRITO SIN RPC
router.get('/today', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        const today = new Date().toLocaleDateString('en-CA', { timeZone: clientTimezone });

        const { data, error } = await req.supabase
            .from('registros')
            .select('*')
            .eq('profile_id', profileId)
            .gte('created_at', `${today}T00:00:00Z`)
            .lte('created_at', `${today}T23:59:59Z`)
            .order('created_at', { ascending: false })
            .limit(1);

        // Si hay un error REAL en la base de datos, lo lanzamos.
        if (error) throw error;
        
        const registroDeHoy = data && data.length > 0 ? data[0] : null;

        // SIEMPRE respondemos con 200 OK. La ausencia de datos se comunica con 'null'.
        res.status(200).json({ registro: registroDeHoy });

    } catch (err) {
        console.error("Error en GET /registros/today:", err.message);
        // Solo si hay un error catastrófico, devolvemos un 500.
        res.status(500).json({ error: 'Error al verificar el registro de hoy.' });
    }
});

// POST / - ADAPTADO A LA NUEVA ESTRUCTURA
router.post('/', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario } = req.body;

        const menteNum = parseInt(mente_estado, 10);
        const emocionNum = parseInt(emocion_estado, 10);
        const cuerpoNum = parseInt(cuerpo_estado, 10);
        
        const avg = (menteNum + emocionNum + cuerpoNum) / 3;
        let estado_general = 'nublado';
        if (avg >= 66) estado_general = 'soleado';
        if (avg < 33) estado_general = 'lluvioso';

        const { data: nuevoRegistro, error: registroError } = await req.supabase
            .from('registros')
            .insert({
                profile_id: profileId,
                mente_estado: menteNum,
                mente_comentario: mente_comentario,
                emocion_estado: emocionNum,
                emocion_comentario: emocion_comentario,
                cuerpo_estado: cuerpoNum,
                cuerpo_comentario: cuerpo_comentario,
                estado_general: estado_general
            })
            .select()
            .single();

        if (registroError) throw registroError;

        // La lógica de OpenAI no cambia, pero ahora no hay meta
        const promptDeTarea = construirPromptDeRegistro(nuevoRegistro);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: promptDeTarea }
            ],
            max_tokens: 60,
        });
        const fraseGenerada = completion.choices[0].message.content.trim();

        const { data: registroActualizado, error: updateError } = await req.supabase
            .from('registros')
            .update({ frase_sunny: fraseGenerada })
            .eq('id', nuevoRegistro.id)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        res.status(201).json(registroActualizado);

    } catch (err) {
        console.error("Error al crear el registro:", err.message);
        res.status(500).json({ error: 'Error en el servidor al procesar el registro.' });
    }
});


// PUT /:id/hoja_atras - REESCRITO SIN RPC
router.put('/:id/hoja_atras', async (req, res) => {
    try {
        const { id: recordId } = req.params;
        const { id: profileId } = req.user;
        const { texto } = req.body;
        
        const { data, error } = await req.supabase
            .from('registros')
            .update({ hoja_atras: texto })
            .eq('id', Number(recordId))
            .eq('profile_id', profileId) // Doble chequeo de seguridad
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Registro no encontrado o sin permiso.' });
        
        res.status(200).json({ message: 'Hoja de atrás guardada con éxito.', registro: data });
    } catch (err) {
        console.error("Error en PUT /:id/hoja_atras:", err.message);
        res.status(500).json({ error: 'Error interno al guardar la entrada.' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
// Importamos el cliente de Supabase directamente
const supabase = require('../config/supabase'); 
const { PERSONALIDAD_SUNNY, construirPromptDeRegistro, construirPromptDeMeta, clasificarEstado } = require('../config/prompts.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- NUEVA RUTA: Sugerir Meta (Anónimo) ---
router.post('/sugerir', async (req, res) => {
    try {
        const { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario } = req.body;

        // 1. Reconstruimos el registro "fake" para el prompt
        const registroData = {
            mente_estado, mente_comentario,
            emocion_estado, emocion_comentario,
            cuerpo_estado, cuerpo_comentario
        };

        // 2. Usamos el mismo prompt que para usuarios registrados
        const promptDeMeta = construirPromptDeMeta(registroData);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: promptDeMeta }
            ],
            response_format: { type: "json_object" },
            max_tokens: 150,
        });
        
        const respuestaJson = completion.choices[0].message.content;
        const sugerencia = JSON.parse(respuestaJson);

        res.status(200).json({ meta_sugerida: sugerencia.meta_sugerida });

    } catch (err) {
        console.error("Error sugerencia anónima:", err.message);
        res.status(500).json({ error: 'Error al generar sugerencia.' });
    }
});

// --- GUARDAR RITUAL COMPLETO ---
router.post('/guardar', async (req, res) => {
    try {
        const { 
            mente_estado, mente_comentario,
            emocion_estado, emocion_comentario,
            cuerpo_estado, cuerpo_comentario,
            meta_descripcion
        } = req.body;

        const datosParaSunny = {
            mente_estado, mente_comentario,
            emocion_estado, emocion_comentario,
            cuerpo_estado, cuerpo_comentario,
            meta_descripcion
        };

        const prompt = construirPromptDeRegistro(datosParaSunny);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 350,
        });

        const respuestaJson = completion.choices[0].message.content;
        const consejos = JSON.parse(respuestaJson); 

        const userAgent = req.get('User-Agent') || 'Unknown';
        
        // USAMOS 'supabase' importado, NO 'req.supabase'
        const { data, error } = await supabase
            .from('registros_anonimos')
            .insert({
                mente_estado, mente_comentario,
                emocion_estado, emocion_comentario,
                cuerpo_estado, cuerpo_comentario,
                meta_descripcion,
                consejo_mente: consejos.consejo_mente,
                consejo_emocion: consejos.consejo_emocion,
                consejo_cuerpo: consejos.consejo_cuerpo,
                frase_aliento: consejos.frase_aliento,
                dispositivo: userAgent
            })
            .select()
            .single();

        if (error) {
            console.error("Error Supabase:", error);
            // No bloqueamos la respuesta al usuario, pero logueamos el error
        }

        const respuestaParaFrontend = {
            ...datosParaSunny,
            ...consejos,
            id: data?.id || Date.now()
        };

        res.status(200).json(respuestaParaFrontend);

    } catch (err) {
        console.error("Error guardado anónimo:", err);
        res.status(500).json({ error: 'Error interno.' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const { count, error: countError } = await supabase
            .from('registros_anonimos')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        const { data: ultimos } = await supabase
            .from('registros_anonimos')
            .select('created_at, mente_estado, emocion_estado, cuerpo_estado')
            .order('created_at', { ascending: false })
            .limit(50);

        res.status(200).json({
            total_rituales: count,
            muestras: ultimos || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Error stats' });
    }
});

module.exports = router;
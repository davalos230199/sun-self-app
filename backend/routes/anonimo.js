const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const supabase = require('../config/supabase'); 
const { PERSONALIDAD_SUNNY, construirPromptDeRegistro, construirPromptDeMeta } = require('../config/prompts.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- RUTA DE ESTADÍSTICAS GLOBALES ---
router.get('/stats', async (req, res) => {
    try {
        // 1. Traemos los datos del gráfico (Prioridad visual)
        const { data: ultimos, error: dataError } = await supabase
            .from('registros_anonimos')
            .select('mente_estado, emocion_estado, cuerpo_estado')
            .order('created_at', { ascending: false })
            .limit(50);

        if (dataError) throw dataError;

        // 2. Intentamos contar
        const { count, error: countError } = await supabase
            .from('registros_anonimos')
            .select('id', { count: 'exact', head: true });
        
        // LÓGICA DE RESPALDO:
        let totalReal = count || 0;
        // Si el gráfico tiene más datos que el contador oficial (por error de RLS), ganan los datos visuales.
        if (ultimos && ultimos.length > totalReal) {
            totalReal = ultimos.length;
        }

        // 3. Calculamos promedios
        let promedios = { mente: 0, emocion: 0, cuerpo: 0 };
        
        if (ultimos && ultimos.length > 0) {
            const sumas = ultimos.reduce((acc, curr) => ({
                mente: acc.mente + (curr.mente_estado || 0),
                emocion: acc.emocion + (curr.emocion_estado || 0),
                cuerpo: acc.cuerpo + (curr.cuerpo_estado || 0)
            }), { mente: 0, emocion: 0, cuerpo: 0 });

            promedios = {
                mente: Math.round(sumas.mente / ultimos.length),
                emocion: Math.round(sumas.emocion / ultimos.length),
                cuerpo: Math.round(sumas.cuerpo / ultimos.length)
            };
        }

        // --- AQUÍ ESTABA EL ERROR DE NOMBRE ---
        res.status(200).json({
            totalRegistros: totalReal, // <--- CAMBIADO DE total_rituales A totalRegistros
            promedios: promedios
        });

    } catch (err) {
        console.error("Error crítico en stats:", err.message);
        res.status(200).json({ totalRegistros: 0, promedios: { mente: 0, emocion: 0, cuerpo: 0 } });
    }
});

// ... (Resto del archivo igual: rutas /sugerir y /guardar) ...
router.post('/sugerir', async (req, res) => {
    try {
        const { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario } = req.body;
        const registroData = { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario };
        const promptDeMeta = construirPromptDeMeta(registroData);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "system", content: PERSONALIDAD_SUNNY }, { role: "user", content: promptDeMeta }],
            response_format: { type: "json_object" }, max_tokens: 150,
        });
        const sugerencia = JSON.parse(completion.choices[0].message.content);
        res.status(200).json({ meta_sugerida: sugerencia.meta_sugerida });
    } catch (err) { res.status(500).json({ error: 'Error sugerencia' }); }
});

router.post('/guardar', async (req, res) => {
    try {
        const { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario, meta_descripcion } = req.body;
        const datosParaSunny = { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario, meta_descripcion };
        const prompt = construirPromptDeRegistro(datosParaSunny);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "system", content: PERSONALIDAD_SUNNY }, { role: "user", content: prompt }],
            response_format: { type: "json_object" }, max_tokens: 350,
        });
        const consejos = JSON.parse(completion.choices[0].message.content); 
        const userAgent = req.get('User-Agent') || 'Unknown';
        const { data, error } = await supabase.from('registros_anonimos').insert({
                mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario, meta_descripcion,
                consejo_mente: consejos.consejo_mente, consejo_emocion: consejos.consejo_emocion, consejo_cuerpo: consejos.consejo_cuerpo,
                frase_aliento: consejos.frase_aliento, dispositivo: userAgent
            }).select().single();
        if (error) console.error("Error Supabase:", error);
        const respuestaParaFrontend = { ...datosParaSunny, ...consejos, id: data?.id || Date.now() };
        res.status(200).json(respuestaParaFrontend);
    } catch (err) { res.status(500).json({ error: 'Error interno.' }); }
});

module.exports = router;
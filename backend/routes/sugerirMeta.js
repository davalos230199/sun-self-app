// backend/routes/sugerirMeta.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { OpenAI } = require('openai');
// Importamos la nueva función del prompt
const { PERSONALIDAD_SUNNY, construirPromptDeMeta } = require('../config/prompts.js'); 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.use(authMiddleware);

// POST /sugerirMeta - RUTA PARA OBTENER UNA META RECOMENDADA DE LA IA
router.post('/', async (req, res) => {
    try {
        const { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario } = req.body;
        
        // 1. Crear el prompt con los datos recibidos
        const promptDeMeta = construirPromptDeMeta({
            mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario
        });
        
        // 2. Llamada a OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: promptDeMeta }
            ],
            response_format: { type: "json_object" }, // Forzamos JSON
            max_tokens: 100, // Menos tokens que el registro completo
        });
        
        const respuestaJson = completion.choices[0].message.content;
        const sugerencia = JSON.parse(respuestaJson); // { meta_sugerida: "..." }

        // 3. Devolver solo el texto de la meta al frontend
        // Usamos 200 OK porque es una consulta y no un insert.
        res.status(200).json({ meta_sugerida: sugerencia.meta_sugerida });

    } catch (err) {
        console.error("Error al obtener la meta sugerida:", err.message);
        // Si falla la IA o el parseo, devolvemos un error.
        res.status(500).json({ error: 'Error interno al generar la meta sugerida.' });
    }
});

module.exports = router;
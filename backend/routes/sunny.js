const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const authMiddleware = require('../middleware/auth');
const { PERSONALIDAD_SUNNY } = require('../config/prompts.js');

// --- Inicialización de OpenAI ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.use(authMiddleware);

// =================================================================
// 2. RUTA DE CHAT
// =================================================================
router.post('/', async (req, res) => {
    const { history } = req.body;
    if (!history || !Array.isArray(history) || history.length === 0) {
        return res.status(400).json({ error: 'Se requiere un historial de mensajes (history).' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: PERSONALIDAD_SUNNY
                },
                ...history
            ],
        });
        
        res.json({ reply: completion.choices[0].message.content });

    } catch (error) {
        console.error('--- SUNNY API (CHAT): ERROR ---', error);
        res.status(500).json({ error: 'No se pudo obtener una respuesta de Sunny.' });
    }
});

// =================================================================
// 3. RUTA: GENERAR Y GUARDAR FRASE DEL DÍA
// =================================================================
router.post('/generar-frase', async (req, res) => {
    const { mente_estat, emocion_estat, cuerpo_estat, meta_del_dia, registroId } = req.body;
    const { id: userId } = req.user;

    if (!mente_estat || !emocion_estat || !cuerpo_estat || !registroId) {
        return res.status(400).json({ error: 'Faltan datos del estado o el ID del registro.' });
    }

    const promptDeTarea = `
      Basado en el siguiente estado del usuario que acaba de completar su registro diario:
      - Mente: ${mente_estat}
      - Emoción: ${emocion_estat}
      - Cuerpo: ${cuerpo_estat}
      - Meta del Día: ${meta_del_dia || "No definida"}

      Genera una única frase corta y reflexiva (máximo 25 palabras) que actúe como un espejo de su estado, usando tu personalidad de guía compasivo. Esta frase será lo primero que vea en su dashboard. No incluyas comillas en tu respuesta.
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: promptDeTarea }
            ],
            max_tokens: 60,
        });

        const fraseGenerada = completion.choices[0].message.content.trim();

        // Usamos la nueva función RPC para actualizar la frase
        const { error: dbError } = await req.supabase.rpc('update_frase_sunny', {
            p_user_id: userId,
            p_registro_id: registroId,
            p_frase: fraseGenerada
        });

        if (dbError) {
            console.error('--- SUNNY API (DB SAVE): ERROR ---', dbError);
            // No detenemos el flujo, el usuario igual recibe su frase.
        }
        
        res.json({ frase: fraseGenerada });

    } catch (error) {
        console.error('--- SUNNY API (FRASE): ERROR ---', error);
        res.status(500).json({ error: 'No se pudo generar la frase del día.' });
    }
});

module.exports = router;

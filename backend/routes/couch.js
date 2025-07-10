// backend/routes/coach.js

const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const authMiddleware = require('../middleware/auth');

// Inicializamos OpenAI aquí
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Protegemos la ruta a nivel del router
router.use(authMiddleware);

// RUTA PARA HABLAR CON EL COACH -> POST /api/coach
router.post('/', async (req, res) => {
  console.log('--- COACH API: Petición recibida en /api/coach ---');
  const { message } = req.body;
  if (!message) {
    console.log('--- COACH API: Error - El mensaje está vacío.');
    return res.status(400).json({ error: 'Se requiere un mensaje.' });
  }

  try {
    console.log(`--- COACH API: Intentando llamar a OpenAI con el mensaje: "${message}"`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Eres una conciencia-espejo. Tu identidad se define por las conversaciones previas sobre el proyecto 'Sun-Self'. Tu propósito no es guiar, sino reflejar y sondear con una curiosidad tranquila...` // (Tu prompt largo y detallado va aquí)
        },
        { role: "user", content: message }
      ],
    });
    
    console.log('--- COACH API: Llamada a OpenAI exitosa.');
    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('--- COACH API: ERROR CATASTRÓFICO ---');
    console.error('El objeto de error completo es:', error);
    res.status(500).json({ error: 'No se pudo obtener una respuesta del coach.' });
  }
});

module.exports = router;

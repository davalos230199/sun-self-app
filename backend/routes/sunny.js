// backend/routes/sunny.js

const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const authMiddleware = require('../middleware/auth');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.use(authMiddleware);

// RUTA PARA HABLAR CON SUNNY -> POST /api/sunny
router.post('/', async (req, res) => {
  console.log('--- SUNNY API: Petición recibida ---');
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Se requiere un mensaje.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Eres Sunny, una conciencia-espejo del proyecto 'Sun-Self'. Tu propósito no es guiar, sino reflejar y sondear con una curiosidad tranquila...` // El resto de tu prompt sigue igual
        },
        { role: "user", content: message }
      ],
    });
    
    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('--- SUNNY API: ERROR ---', error);
    res.status(500).json({ error: 'No se pudo obtener una respuesta de Sunny.' });
  }
});

module.exports = router;

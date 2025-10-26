// En backend/routes/frases.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // Asegúrate que la ruta a tu config de supabase sea correcta

// --- ¡NUEVA RUTA! ---
// GET /api/frases/random
router.get('/random', async (req, res) => {
    try {
        // Tu idea de categorías, ¡la implementamos de una vez!
        const { category } = req.query; // Ej: /random?category=positiva

        let query = supabase.from('frases').select('quote, author');

        // Si el frontend nos pide una categoría, la filtramos
        if (category) {
            query = query.eq('category', category);
        }

        // 1. Obtenemos las frases (filtradas o todas)
        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) {
            // Si no encontramos frases (ej: categoría mal escrita), damos una por defecto
            return res.json({ 
                quote: 'Que tengas un gran día.', 
                author: 'Sun Self' 
            });
        }

        // 2. Elegimos una al azar (lógica en Node.js, súper rápido)
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomFrase = data[randomIndex];

        res.json(randomFrase);

    } catch (error) {
        console.error('Error al obtener frase:', error);
        res.status(500).json({ 
            quote: 'El silencio también es una respuesta.', 
            author: 'Reflexión' 
        });
    }
});

module.exports = router;
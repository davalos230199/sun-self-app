const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// RUTA GET /api/inspiracion?orbe=mente
router.get('/', async (req, res) => {
    const { orbe } = req.query; // 'mente', 'emocion', o 'cuerpo'
    const validOrbes = ['mente', 'emocion', 'cuerpo'];

    if (!orbe || !validOrbes.includes(orbe)) {
        return res.status(400).json({ error: 'Se requiere un "orbe" válido (mente, emocion, cuerpo).' });
    }

    const commentColumn = `${orbe}_coment`;

    try {
        // Usamos una función RPC para obtener una fila aleatoria de manera eficiente
        const { data, error } = await supabase.rpc('get_random_shared_comment', {
            orbe_column: commentColumn
        });

        if (error) throw error;

        res.json({ inspiracion: data || 'No se encontraron ejemplos por ahora. ¡Sé el primero en compartir!' });

    } catch (err) {
        console.error("Error en GET /api/inspiracion:", err);
        res.status(500).json({ error: 'Error al obtener inspiración.' });
    }
});

module.exports = router;

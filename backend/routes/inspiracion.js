const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// GET /api/inspiracion?orbe=mente
router.get('/', async (req, res) => {
    const { orbe } = req.query;

    if (!['mente', 'emocion', 'cuerpo'].includes(orbe)) {
        return res.status(400).json({ error: 'Orbe no válido.' });
    }

    try {
        // CAMBIO CLAVE: Nos aseguramos de que estamos llamando a la función correcta y más reciente.
        const { data, error } = await supabase.rpc('get_inspiracion_aleatoria', { 
            p_orbe: orbe 
        });

        if (error) throw error;

        res.json({ inspiracion: data || 'No hay ejemplos disponibles aún. ¡Sé el primero en compartir!' });
    } catch (err) {
        console.error(`Error en GET /api/inspiracion para el orbe ${orbe}:`, err);
        res.status(500).json({ error: 'Error al obtener inspiración.' });
    }
});

module.exports = router;

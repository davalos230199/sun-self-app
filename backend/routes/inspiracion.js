const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/inspiracion?orbe=mente
router.get('/', async (req, res) => {
    const { orbe } = req.query;

    if (!['mente', 'emocion', 'cuerpo'].includes(orbe)) {
        return res.status(400).json({ error: 'Orbe no válido.' });
    }

    try {
        const { data, error } = await req.supabase.rpc('get_inspiracion_aleatoria', {
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

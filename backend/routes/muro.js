const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// RUTA GET /api/muro/estados -> Ahora devuelve una lista de registros
router.get('/estados', async (req, res) => {
    try {
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        const { data, error } = await req.supabase
            .rpc('get_muro_data', { client_timezone: clientTimezone });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error en GET /api/muro/estados:", err);
        res.status(500).json({ error: 'Error al obtener los estados del muro' });
    }
});

module.exports = router;

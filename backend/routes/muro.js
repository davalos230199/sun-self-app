const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// RUTA GET /api/muro/estados -> Ahora devuelve una lista de registros
router.get('/estados', async (req, res) => {
    try {
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';

        // Usamos una función RPC para obtener los registros del "día local" del cliente.
        // Esto es más complejo pero soluciona el problema de la zona horaria.
        // Primero, necesitas crear esta función en tu SQL Editor de Supabase (ver siguiente paso).
        const { data, error } = await supabase
            .rpc('get_muro_data', { client_timezone: clientTimezone });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error en GET /api/muro/estados:", err);
        res.status(500).json({ error: 'Error al obtener los estados del muro' });
    }
});

module.exports = router;

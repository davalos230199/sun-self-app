    const express = require('express');
    const router = express.Router();
    const { createClient } = require('@supabase/supabase-js');
    const authMiddleware = require('../middleware/auth');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    router.use(authMiddleware);

    // RUTA GET /api/muro/estados
    router.get('/estados', async (req, res) => {
        try {
            // 1. Calculamos el inicio del día de hoy en UTC.
            const hoy = new Date();
            hoy.setUTCHours(0, 0, 0, 0);
            const hoyISO = hoy.toISOString();

            // 2. Consultamos los registros creados desde el inicio del día de hoy.
            const { data, error } = await supabase
                .from('registros')
                .select('estado_general')
                .gte('created_at', hoyISO);

            if (error) throw error;

            // 3. Contamos los estados.
            const conteo = data.reduce((acc, registro) => {
                const estado = registro.estado_general; // 'soleado', 'nublado', 'lluvioso'
                if (estado) {
                    acc[estado] = (acc[estado] || 0) + 1;
                }
                return acc;
            }, { soleado: 0, nublado: 0, lluvioso: 0 }); // Inicializamos para que siempre devuelva los 3.

            res.json(conteo);

        } catch (err) {
            console.error("Error en GET /api/muro/estados:", err);
            res.status(500).json({ error: 'Error al obtener los estados del muro.' });
        }
    });

    module.exports = router;
    
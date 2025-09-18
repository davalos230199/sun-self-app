// backend/routes/metas.js (Versión Reconstruida)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /today - Trae las metas de hoy para el usuario logueado
router.get('/today', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        const today = new Date().toLocaleDateString('en-CA', { timeZone: clientTimezone });

        const { data, error } = await req.supabase
            .from('metas')
            .select('*')
            .eq('profile_id', profileId)
            .gte('created_at', `${today}T00:00:00Z`)
            .lte('created_at', `${today}T23:59:59Z`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data || []);
    } catch (err) {
        console.error("Error en GET /api/metas/today:", err);
        res.status(500).json({ error: 'Error al obtener las metas de hoy' });
    }
});

// POST / - Crea una nueva meta
router.post('/', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({ error: 'La descripción es requerida.' });
        }

        const { data, error } = await req.supabase
            .from('metas')
            .insert({ profile_id: profileId, descripcion: descripcion })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error("Error en POST /api/metas:", err);
        res.status(500).json({ error: 'Error al crear la meta.' });
    }
});

// ... (Aquí irían las rutas PATCH para actualizar y DELETE para borrar metas en el futuro)

module.exports = router;
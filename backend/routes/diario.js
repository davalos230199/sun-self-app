// backend/routes/diario.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /:registroId -> Trae todas las entradas del diario para un registro específico
router.get('/:registroId', async (req, res) => {
    try {
        const { registroId } = req.params;
        const { id: profileId } = req.user;
        const { data, error } = await req.supabase
            .from('diario')
            .select('*')
            .eq('profile_id', profileId)
            .eq('registro_id', registroId)
            .order('created_at', { ascending: true }); // Las más antiguas primero

        if (error) throw error;
        res.status(200).json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las entradas del diario.' });
    }
});

// POST / -> Crea una nueva entrada en el diario
router.post('/', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { registro_id, texto } = req.body;
        const { data, error } = await req.supabase
            .from('diario')
            .insert({ profile_id: profileId, registro_id, texto })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar la entrada del diario.' });
    }
});

module.exports = router;
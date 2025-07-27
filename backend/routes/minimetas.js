// routes/minimetas.js

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(authMiddleware);

// --- OBTENER las mini-metas de un registro específico ---
router.get('/for-registro/:registroId', async (req, res) => {
    try {
        const { registroId } = req.params;
        const { id: userId } = req.user;
        const { data, error } = await supabase
            .from('mini_metas')
            .select('*')
            .eq('registro_id', registroId)
            .eq('user_id', userId)
            .order('hora_objetivo', { ascending: true }); // Ordenamos por hora

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en GET /api/minimetas/for-registro/:registroId :", err);
        res.status(500).json({ error: 'Error al obtener las mini-metas' });
    }
});

// --- CREAR una nueva mini-meta (CORREGIDO) ---
router.post('/', async (req, res) => {
    try {
        // ¡CORRECCIÓN! Ahora aceptamos 'hora_objetivo' del frontend.
        const { descripcion, registro_id, hora_objetivo } = req.body;
        const { id: userId } = req.user;

        if (!descripcion || !registro_id || !hora_objetivo) {
            return res.status(400).json({ error: 'Faltan campos requeridos (descripcion, registro_id, hora_objetivo).' });
        }

        const { data, error } = await supabase
            .from('mini_metas')
            .insert([{
                descripcion: descripcion,
                registro_id: registro_id,
                user_id: userId,
                hora_objetivo: hora_objetivo // Y lo guardamos en la base de datos.
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error("Error en POST /api/minimetas :", err);
        res.status(500).json({ error: 'Error al crear la mini-meta.' });
    }
});

// --- ACTUALIZAR una mini-meta ---
router.patch('/:id', async (req, res) => {
    try {
        const { id: miniMetaId } = req.params;
        const { completada } = req.body;
        const { id: userId } = req.user;
        const { data, error } = await supabase
            .from('mini_metas')
            .update({ completada: completada })
            .eq('id', miniMetaId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Mini-meta no encontrada o sin permiso.' });
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en PATCH /api/minimetas/:id :", err);
        res.status(500).json({ error: 'Error al actualizar la mini-meta.' });
    }
});

// --- BORRAR una mini-meta ---
router.delete('/:id', async (req, res) => {
    try {
        const { id: miniMetaId } = req.params;
        const { id: userId } = req.user;
        const { error, count } = await supabase
            .from('mini_metas')
            .delete({ count: 'exact' })
            .eq('id', miniMetaId)
            .eq('user_id', userId);

        if (error) throw error;
        if (count === 0) {
            return res.status(404).json({ error: 'Mini-meta no encontrada o no tienes permiso.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error("Error en DELETE /api/minimetas/:id :", err);
        res.status(500).json({ error: 'Error al borrar la mini-meta.' });
    }
});

module.exports = router;

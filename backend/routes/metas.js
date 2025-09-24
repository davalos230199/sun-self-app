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
        const { descripcion, hora_objetivo } = req.body;

        if (!descripcion) {
            return res.status(400).json({ error: 'La descripción es requerida.' });
        }

        const { data, error } = await req.supabase
            .from('metas')
            .insert({ profile_id: profileId, descripcion: descripcion, hora_objetivo })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error("Error en POST /api/metas:", err);
        res.status(500).json({ error: 'Error al crear la meta.' });
    }
});

// PATCH /:id - Actualiza una meta (ej: marcar como completada)
router.patch('/:id', async (req, res) => {
    try {
        const { id: metaId } = req.params;
        const { id: profileId } = req.user;
        
        // 1. Extraemos los campos permitidos del body.
        const { descripcion, completada, hora_objetivo } = req.body;

        // 2. Creamos un objeto 'updates' solo con los campos que realmente se enviaron.
        // Esto evita intentar actualizar campos con 'undefined'.
        const updates = {};
        if (descripcion !== undefined) {
            updates.descripcion = descripcion;
        }
        if (completada !== undefined) {
            updates.completada = completada;
        }
        if (hora_objetivo !== undefined) {
            updates.hora_objetivo = hora_objetivo;
        }
        
        // Si el objeto de actualizaciones está vacío, no hacemos nada.
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
        }

        // 3. Usamos el objeto 'updates' genérico en la consulta.
        const { data, error } = await req.supabase
            .from('metas')
            .update(updates) // <-- La magia está aquí.
            .eq('id', metaId)
            .eq('profile_id', profileId)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en PATCH /api/metas/:id:", err);
        res.status(500).json({ error: 'Error al actualizar la meta.' });
    }
});

// DELETE /:id - Borra una meta
router.delete('/:id', async (req, res) => {
    try {
        const { id: metaId } = req.params;
        const { id: profileId } = req.user;

        const { error } = await req.supabase
            .from('metas')
            .delete()
            .eq('id', metaId)
            .eq('profile_id', profileId); // Seguridad: solo puede borrar sus propias metas

        if (error) throw error;
        res.status(204).send(); // 204 No Content: éxito, pero no hay nada que devolver
    } catch (err) {
        console.error("Error en DELETE /api/metas/:id:", err);
        res.status(500).json({ error: 'Error al eliminar la meta.' });
    }
});

module.exports = router;
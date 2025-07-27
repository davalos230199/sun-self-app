// routes/minimetas.js

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth'); // Tu excelente middleware

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Aplicamos el middleware a todas las rutas de este archivo.
// Nadie que no esté autenticado podrá acceder a ellas.
router.use(authMiddleware);

// --- OBTENER las mini-metas de un registro específico ---
// GET /api/minimetas/for-registro/:registroId
router.get('/for-registro/:registroId', async (req, res) => {
    try {
        const { registroId } = req.params;
        const { id: userId } = req.user; // ID del usuario autenticado (de la sesión)

        const { data, error } = await supabase
            .from('mini_metas')
            .select('*')
            .eq('registro_id', registroId)
            .eq('user_id', userId) // Doble chequeo de seguridad: solo trae si el registro le pertenece.
            .order('created_at', { ascending: true }); // Opcional: ordenarlas

        if (error) throw error;

        res.status(200).json(data);

    } catch (err) {
        console.error("Error en GET /api/minimetas/for-registro/:registroId :", err);
        res.status(500).json({ error: 'Error al obtener las mini-metas' });
    }
});


// --- CREAR una nueva mini-meta ---
// POST /api/minimetas
router.post('/', async (req, res) => {
    try {
        const { descripcion, registro_id } = req.body;
        const { id: userId } = req.user; // Usamos el ID de usuario verificado por el middleware.

        if (!descripcion || !registro_id) {
            return res.status(400).json({ error: 'Faltan los campos "descripcion" o "registro_id".' });
        }

        const { data, error } = await supabase
            .from('mini_metas')
            .insert([{
                descripcion: descripcion,
                registro_id: registro_id,
                user_id: userId // El backend asigna el dueño, no se confía en el cliente.
            }])
            .select()
            .single(); // Devuelve el objeto creado, no un array

        if (error) throw error;

        res.status(201).json(data);

    } catch (err) {
        console.error("Error en POST /api/minimetas :", err);
        res.status(500).json({ error: 'Error al crear la mini-meta.' });
    }
});

// --- ACTUALIZAR una mini-meta (ej: marcarla como completada) ---
// PATCH /api/minimetas/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id: miniMetaId } = req.params;
        const { completada } = req.body; // El frontend solo envía lo que cambia
        const { id: userId } = req.user;

        const { data, error } = await supabase
            .from('mini_metas')
            .update({ completada: completada })
            .eq('id', miniMetaId)
            .eq('user_id', userId) // ¡CRÍTICO! Solo permite actualizar si eres el dueño.
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Mini-meta no encontrada o no tienes permiso.' });

        res.status(200).json(data);

    } catch (err) {
        console.error("Error en PATCH /api/minimetas/:id :", err);
        res.status(500).json({ error: 'Error al actualizar la mini-meta.' });
    }
});


// --- BORRAR una mini-meta ---
// DELETE /api/minimetas/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id: miniMetaId } = req.params;
        const { id: userId } = req.user;

        const { error, count } = await supabase
            .from('mini_metas')
            .delete({ count: 'exact' }) // Pide que devuelva el número de filas borradas
            .eq('id', miniMetaId)
            .eq('user_id', userId); // ¡CRÍTICO! Solo permite borrar si eres el dueño.

        if (error) throw error;
        if (count === 0) {
            return res.status(404).json({ error: 'Mini-meta no encontrada o no tienes permiso.' });
        }

        res.status(204).send(); // 204 No Content: éxito, pero no hay nada que devolver

    } catch (err) {
        console.error("Error en DELETE /api/minimetas/:id :", err);
        res.status(500).json({ error: 'Error al borrar la mini-meta.' });
    }
});


module.exports = router;
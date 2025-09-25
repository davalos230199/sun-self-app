// backend/routes/diario.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /:registroId -> Trae todas las entradas del diario para un registro específico
router.get('/', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        let fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1); // Traemos el último mes por defecto

        const { data, error } = await req.supabase
            .from('diario')
            .select('*')
            .eq('profile_id', profileId)
            .gte('created_at', fechaInicio.toISOString());

        if (error) throw error;
        
        // La lógica de ordenamiento en JS sigue siendo perfecta
        const prioridadValor = { 'alta': 3, 'media': 2, 'baja': 1 };
        const datosOrdenados = (data || []).sort((a, b) => {
        const prioridadA = prioridadValor[a.prioridad] || 0;
        const prioridadB = prioridadValor[b.prioridad] || 0;
            if (prioridadB !== prioridadA) {
                return prioridadB - prioridadA; // Ordena por prioridad primero
            }
            // Si la prioridad es la misma, ordena por fecha (más nuevo primero)
            return new Date(b.created_at) - new Date(a.created_at);
        });

        res.status(200).json(datosOrdenados);

    } catch (err) {
        console.error("Error en GET /diario:", err.message);
        res.status(500).json({ error: 'Error al obtener las entradas del diario.' });
    }
});

// POST / -> Crea una nueva entrada en el diario
router.post('/', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        // 1. Read 'prioridad' from the request body, along with the other data.
        const { registro_id, texto, prioridad } = req.body; 
        const { data, error } = await req.supabase
            .from('diario')
            // 2. Use the 'prioridad' variable in the insert statement.
            .insert({ profile_id: profileId, registro_id, texto, prioridad: prioridad || 'baja' }) 
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar la entrada del diario.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { id: entradaId } = req.params;

        const { error } = await req.supabase
            .from('diario')
            .delete()
            .eq('profile_id', profileId) // Por seguridad, solo borra si es del usuario
            .eq('id', entradaId);

        if (error) throw error;

        res.status(204).send(); // 204 No Content es la respuesta estándar para un delete exitoso

    } catch (err) {
        console.error("Error al eliminar entrada:", err.message);
        res.status(500).json({ error: 'Error al eliminar la entrada del diario.' });
    }
});

module.exports = router;
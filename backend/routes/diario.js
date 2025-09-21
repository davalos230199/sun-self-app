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

        // 1. Traemos los datos SIN ordenar por prioridad desde Supabase
        const { data, error } = await req.supabase
            .from('diario')
            .select('*')
            .eq('profile_id', profileId)
            .eq('registro_id', registroId)
            .order('created_at', { ascending: true }); // Solo ordenamos por fecha inicialmente

        if (error) throw error;

        // 2. Creamos un mapa de valor para las prioridades
        const prioridadValor = { 'alta': 3, 'media': 2, 'baja': 1 };

        // 3. Ordenamos el array en nuestro código JavaScript
        const datosOrdenados = (data || []).sort((a, b) => {
            // Asignamos 0 si la prioridad es nula o no existe
            const prioridadA = prioridadValor[a.prioridad] || 0;
            const prioridadB = prioridadValor[b.prioridad] || 0;
            // Comparamos: el que tenga mayor valor de prioridad, va primero.
            return prioridadB - prioridadA;
        });

        res.status(200).json(datosOrdenados);
    } catch (err) {
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
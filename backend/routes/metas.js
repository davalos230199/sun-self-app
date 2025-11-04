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

// GET /stats - Trae estadísticas de metas históricas
router.get('/stats', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        
        // --- AÑADIDO: El filtro de fecha ---
        const fechaInicioLimpia = '2025-09-19T00:00:00Z'; // Ignora todo lo anterior

        // Contar completadas (con filtro)
        const { count: completadas, error: errCompletadas } = await req.supabase
            .from('metas')
            .select('id', { count: 'exact', head: true }) // Solo contamos
            .eq('profile_id', profileId)
            .eq('completada', true)
            .gte('created_at', fechaInicioLimpia); // <-- AQUÍ LA MAGIA

        if (errCompletadas) throw errCompletadas;

        // Contar incompletas (con filtro)
        const { count: incompletas, error: errIncompletas } = await req.supabase
            .from('metas')
            .select('id', { count: 'exact', head: true })
            .eq('profile_id', profileId)
            .eq('completada', false)
            .gte('created_at', fechaInicioLimpia); // <-- AQUÍ LA MAGIA
        
        if (errIncompletas) throw errIncompletas;

        res.status(200).json({
            completadas: completadas || 0,
            incompletas: incompletas || 0
        });

    } catch (err) {
        console.error("Error en GET /api/metas/stats:", err);
        res.status(500).json({ error: 'Error al obtener las estadísticas de metas' });
    }
});

// --- NUEVA RUTA: GET /historial ---
// Trae todas las metas agrupadas por día, identificando la principal.
router.get('/historial', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const fechaInicioLimpia = '2025-09-19T00:00:00Z'; // La fecha de limpieza

        // 1. Traer todos los registros (con su meta principal)
        const { data: registros, error: regError } = await req.supabase
            .from('registros')
            .select('id, created_at, meta_principal_id')
            .eq('profile_id', profileId)
            .gte('created_at', fechaInicioLimpia)
            .order('created_at', { ascending: false }); // Más nuevos primero

        if (regError) throw regError;

        // 2. Traer TODAS las metas desde la fecha
        const { data: metas, error: metasError } = await req.supabase
            .from('metas')
            .select('*') // Traemos todo de las metas
            .eq('profile_id', profileId)
            .gte('created_at', fechaInicioLimpia);
        
        if (metasError) throw metasError;

        // 3. (Alambres) Agrupar metas por fecha (YYYY-MM-DD) para búsqueda rápida
        const metasPorFecha = new Map();
        for (const meta of metas) {
            const fecha = meta.created_at.split('T')[0]; // Clave '2025-11-04'
            if (!metasPorFecha.has(fecha)) {
                metasPorFecha.set(fecha, []);
            }
            metasPorFecha.get(fecha).push(meta);
        }

        // 4. (Alambres) Construir la respuesta final
        const historialDias = [];
        for (const registro of registros) {
            const fechaRegistro = registro.created_at.split('T')[0];
            const metasDelDia = metasPorFecha.get(fechaRegistro) || [];
            
            let metaPrincipal = null;
            const metasSecundarias = [];

            // Separamos la principal del resto
            for (const meta of metasDelDia) {
                if (meta.id === registro.meta_principal_id) {
                    metaPrincipal = meta;
                } else {
                    metasSecundarias.push(meta);
                }
            }

            // Solo añadimos el día al historial si tuvo una meta principal
            // (que es el centro de tu diseño visual)
            if (metaPrincipal) {
                historialDias.push({
                    fecha: registro.created_at, // La fecha exacta del registro
                    meta_principal: metaPrincipal,
                    metas_secundarias: metasSecundarias
                });
            }
        }
        
        res.status(200).json(historialDias);

    } catch (err) {
        console.error("Error en GET /api/metas/historial:", err);
        res.status(500).json({ error: 'Error al construir el historial de metas' });
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
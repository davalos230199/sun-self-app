// Archivo: backend/routes/registros.js

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Middleware para todas las rutas de este archivo
router.use(authMiddleware);

// --- RUTA GET PARA OBTENER EL REGISTRO DE HOY USANDO RPC ---
router.get('/today', async (req, res) => {
    try {
        const userId = req.user.id;
        // Obtenemos la zona horaria que el frontend nos envía en cada petición
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';

        console.log(`[BACKEND RPC] Llamando a la función 'get_registro_de_hoy' para el usuario: ${userId}`);

        // Llamamos a la función de Supabase en lugar de a la tabla directamente
        const { data: registro, error } = await supabase.rpc('get_registro_de_hoy', {
            p_user_id: userId,
            p_client_timezone: clientTimezone
        });

        if (error) {
            console.error('[BACKEND RPC ERROR] Error al llamar a la función get_registro_de_hoy:', error);
            throw error;
        }

        console.log(`[BACKEND RPC ÉXITO] La función devolvió:`, registro);
        
        // Las funciones que devuelven SETOF registros, devuelven un array. Si no hay registro, el array está vacío.
        // Tomamos el primer elemento si existe, o null si no.
        const registroDeHoy = registro && registro.length > 0 ? registro[0] : null;

        res.json({ registro: registroDeHoy });

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al obtener el registro.' });
    }
});

// --- RUTA POST PARA CREAR UN NUEVO REGISTRO USANDO RPC ---
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            mente_estado, mente_descripcion,
            emocion_estado, emocion_descripcion,
            cuerpo_estado, cuerpo_descripcion,
            meta_descripcion
        } = req.body;
        
        console.log(`[BACKEND RPC] Llamando a la función 'create_registro' para el usuario: ${userId}`);

        // Llamamos a la función de Supabase para crear el registro.
        // Toda la lógica de calcular estado_general, frase_sunny, etc.,
        // ahora DEBERÍA estar dentro de la función en Supabase, que es la arquitectura correcta.
        const { data: nuevoRegistro, error } = await supabase.rpc('create_registro', {
            p_user_id: userId,
            p_mente_estat: mente_estado,
            p_mente_coment: mente_descripcion,
            p_emocion_estat: emocion_estado,
            p_emocion_coment: emocion_descripcion,
            p_cuerpo_estat: cuerpo_estado,
            p_cuerpo_coment: cuerpo_descripcion,
            p_estado_general: null, // Dejamos que la función de la BD lo calcule
            p_meta_del_dia: meta_descripcion,
            p_compartir_anonimo: false // Valor por defecto
        });

        if (error) {
            console.error('[BACKEND RPC ERROR] Error al llamar a la función create_registro:', error);
            throw error;
        }

        console.log('[BACKEND RPC ÉXITO] Registro creado:', nuevoRegistro);
        res.status(201).json(nuevoRegistro);

    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el registro.' });
    }
});

// Exportamos el router
module.exports = router;
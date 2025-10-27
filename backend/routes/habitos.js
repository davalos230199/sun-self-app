// EN: backend/routes/habitos.js (¡Archivo NUEVO!)

const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth'); // Tu middleware
const supabase  = require('../config/supabase'); // El cliente de Supabase

const PIXELA_USERNAME = process.env.PIXELA_USERNAME;
const PIXELA_TOKEN = process.env.PIXELA_TOKEN;

// Protegemos todas las rutas de hábitos
router.use(authMiddleware);

// --- RUTA 1: Crear un nuevo hábito (en Supabase + Pixela) ---
// POST /api/habitos/crear
router.post('/crear', async (req, res) => {
    const { nombre } = req.body;
    const { id: profileId } = req.user; // Usamos 'profile_id' de tu auth
    
    // ID único para el gráfico de Pixela
    // BIEN (Corto y cumple la regla [a-z][a-z0-9-]{1,16})
    const idUsuario = profileId.substring(0, 4); // 4 caracteres del ID de usuario
    const idTiempo = Date.now().toString().slice(-5); // Últimos 5 dígitos del timestamp
    const graphID = `s-${idUsuario}-${idTiempo}`; // Ej: "s-f47a-47000" (Total: 12 chars)

    try {
        // --- Paso 1: Crear el gráfico en Pixela ---
        await axios.post(
            `https://pixe.la/v1/users/${PIXELA_USERNAME}/graphs`,
            {
                id: graphID,
                name: nombre,
                unit: "completado",
                type: "int",
                color: "shibafu" // Verde
            },
            { headers: { 'X-USER-TOKEN': PIXELA_TOKEN } }
        );

        // --- Paso 2: Guardar la definición en nuestra tabla 'habitos' ---
        const { error: dbError } = await supabase
            .from('habitos') // <-- Usando la NUEVA tabla
            .insert({
                profile_id: profileId,
                nombre: nombre,
                pixela_graph_id: graphID
            });
        
        if (dbError) throw dbError;

        res.status(201).json({ message: 'Hábito creado con éxito', graphID });

    } catch (error) {
        console.error("Error creando hábito:", error.response?.data || error.message);
        res.status(500).json({ message: "Error al crear el hábito" });
    }
});

// --- RUTA 2: Registrar un "pixel" (marcar como hecho) ---
// POST /api/habitos/log/:graphID
router.post('/log/:graphID', async (req, res) => {
    const { graphID } = req.params;
    
    // Formato de fecha yyyyMMdd
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const fechaPixela = `${year}${month}${day}`;

    try {
        await axios.post(
            `https://pixe.la/v1/users/${PIXELA_USERNAME}/graphs/${graphID}`,
            { date: fechaPixela, quantity: "1" },
            { headers: { 'X-USER-TOKEN': PIXELA_TOKEN } }
        );
        res.status(200).json({ message: '¡Hábito registrado!' });
    } catch (error) {
        console.error("Error registrando pixel:", error.response?.data || error.message);
        res.status(500).json({ message: "Error al registrar el hábito" });
    }
});

// --- RUTA 3: Obtener todos mis hábitos (de la tabla 'habitos') ---
// GET /api/habitos/
router.get('/', async (req, res) => {
    const { id: profileId } = req.user;
    try {
        const { data, error } = await supabase
            .from('habitos') // <-- Usando la NUEVA tabla
            .select('id, nombre, pixela_graph_id')
            .eq('profile_id', profileId);
        
        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener hábitos" });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
// NOTA: Ya no necesitamos bcrypt porque Supabase manejará las contraseñas
// const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// Usamos la clave de servicio (service_role) para poder crear usuarios desde el backend
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);

// --- RUTA DE REGISTRO USANDO EL MÉTODO CORRECTO DE SUPABASE ---
router.post('/register', async (req, res) => {
    const { email, password, nombre, apellido, apodo } = req.body;

    if (!email || !password || !nombre || !apellido || !apodo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    try {
        // 1. Verificamos si el apodo ya existe
        const { data: apodoData, error: apodoError } = await supabase
            .from('users')
            .select('apodo')
            .eq('apodo', apodo)
            .single();

        if (apodoError && apodoError.code !== 'PGRST116') throw apodoError; // Ignora el error "not found"
        if (apodoData) {
            return res.status(409).json({ error: 'Ese apodo ya está en uso. Elige otro.' });
        }

        // 2. Usamos supabase.auth.signUp() para registrar al usuario
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nombre: nombre,
                    apellido: apellido,
                    apodo: apodo
                }
            }
        });

        if (error) {
            return res.status(error.status || 400).json({ error: error.message });
        }
        
        // Si tienes la confirmación por email desactivada, el usuario ya tendrá una sesión.
        // Si está activada, necesitará confirmar su email.
        res.status(201).json({ 
            message: 'Usuario registrado con éxito.', 
            user: data.user,
            session: data.session
        });

    } catch (err) {
        console.error("Error en /register:", err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// --- RUTA DE LOGIN USANDO EL MÉTODO CORRECTO DE SUPABASE ---
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Se requieren identificador y contraseña.' });
    }

    try {
        // Usamos supabase.auth.signInWithPassword() que maneja la contraseña de forma segura.
        // Supabase permite iniciar sesión con email por defecto.
        // Para iniciar sesión con apodo, necesitaríamos una lógica más compleja.
        // Por ahora, simplificamos a que el 'identifier' debe ser el email.
        const { data, error } = await supabase.auth.signInWithPassword({
            email: identifier, // Asumimos que el identificador es el email
            password: password,
        });

        if (error) {
            return res.status(error.status || 401).json({ message: error.message });
        }

        // El 'data.session.access_token' es el nuevo JWT
        res.json({ token: data.session.access_token });

    } catch (err) {
        console.error("Error en /login:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// La ruta /me no cambia, ya que simplemente decodifica el token que ahora contiene el apodo.
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Usamos la service key
const supabase = createClient(supabaseUrl, supabaseKey);


// --- RUTA DE REGISTRO (Sin cambios, ya está bien) ---
router.post('/register', async (req, res) => {
    const { email, password, nombre, apellido, apodo } = req.body;

    if (!email || !password || !nombre || !apellido || !apodo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    try {
        const { data: apodoExistente, error: rpcError } = await supabase
            .rpc('check_if_apodo_exists', { p_apodo: apodo });

        if (rpcError) throw rpcError;

        if (apodoExistente) {
            return res.status(409).json({ error: 'Ese apodo ya está en uso. Elige otro.' });
        }

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
        
        res.status(201).json({ 
            message: 'Usuario registrado con éxito. Revisa tu email para confirmar la cuenta.', 
            user: data.user,
            session: data.session
        });

    } catch (err) {
        console.error("Error en /register:", err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// --- RUTA DE LOGIN INTELIGENTE (Versión Final) ---
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Se requieren identificador y contraseña.' });
    }

    let userEmail = identifier;

    try {
        // Paso 1: Determinar si el identificador es un email o un apodo
        if (!identifier.includes('@')) {
            // No es un email, asumimos que es un apodo y buscamos su email con la función RPC
            const { data: emailFromApodo, error: rpcError } = await supabase
                .rpc('get_email_by_apodo', { p_apodo: identifier });

            if (rpcError) throw rpcError;

            if (!emailFromApodo) {
                // Si no encontramos un email para ese apodo, las credenciales son incorrectas
                return res.status(401).json({ message: 'Credenciales incorrectas.' });
            }
            userEmail = emailFromApodo;
        }

        // Paso 2: Intentar el inicio de sesión con el email determinado
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
        });

        if (error) {
            // Si Supabase devuelve un error (ej: contraseña incorrecta), lo pasamos al frontend
            return res.status(error.status || 401).json({ message: 'Credenciales incorrectas.' });
        }

        // Si el login es exitoso, devolvemos el token JWT
        res.json({ token: data.session.access_token });

    } catch (err) {
        console.error("Error en /login:", err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// La ruta /me no cambia, ya que simplemente decodifica el token que ahora contiene el apodo.
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;

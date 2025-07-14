const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- RUTA DE REGISTRO ACTUALIZADA Y SEGURA CON RLS ---
router.post('/register', async (req, res) => {
    const { email, password, nombre, apellido, apodo } = req.body;

    if (!email || !password || !nombre || !apellido || !apodo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    try {
        // CAMBIO: Usamos una función RPC para verificar si el apodo existe de forma segura
        const { data: apodoExistente, error: rpcError } = await supabase
            .rpc('check_if_apodo_exists', { apodo_param: apodo });

        if (rpcError) throw rpcError; // Si la función falla, lanzamos un error

        if (apodoExistente === true) {
            return res.status(409).json({ error: 'Ese apodo ya está en uso. Elige otro.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // El 'insert' funciona porque tenemos una política que permite a cualquier usuario
        // insertar en la tabla 'users', pero con un 'check' que asegura que el id coincida.
        // En este caso, como no hay un usuario autenticado, la política de INSERT normal no aplicaría,
        // pero Supabase maneja la creación de usuarios de forma especial.
        // Si esto diera problemas, se tendría que crear un RPC para el registro también.
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, nombre, apellido, apodo }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'El email ya está en uso.' });
            }
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: 'Usuario creado con éxito', user: data[0] });
    } catch (err) {
        console.error("Error en /register:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// --- RUTA DE LOGIN ACTUALIZADA Y SEGURA CON RLS ---
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Se requieren identificador y contraseña.' });
    }

    try {
        // CAMBIO: Usamos la función RPC 'get_user_by_identifier' que creamos
        const { data: users, error } = await supabase
            .rpc('get_user_by_identifier', { identifier: identifier });

        if (error || !users || users.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // El resto no cambia
        const token = jwt.sign(
            { id: user.id, email: user.email, nombre: user.nombre, apodo: user.apodo },
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        res.json({ token });
    } catch (err) {
        console.error("Error en /login:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// La ruta /me no cambia
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
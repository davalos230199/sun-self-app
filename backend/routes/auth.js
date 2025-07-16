const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// RUTA DE REGISTRO
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
            options: { data: { nombre, apellido, apodo } }
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

// RUTA DE LOGIN INTELIGENTE
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Se requieren identificador y contraseña.' });
    }

    let userEmail = identifier;

    try {
        if (!identifier.includes('@')) {
            const { data: emailFromApodo, error: rpcError } = await supabase
                .rpc('get_email_by_apodo', { p_apodo: identifier });

            if (rpcError || !emailFromApodo) {
                return res.status(401).json({ message: 'Credenciales incorrectas.' });
            }
            userEmail = emailFromApodo;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
        });

        if (error) {
            return res.status(error.status || 401).json({ message: 'Credenciales incorrectas.' });
        }

        res.json({ token: data.session.access_token });

    } catch (err) {
        console.error("Error en /login:", err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// --- CAMBIO: NUEVA RUTA PARA OLVIDÉ MI CONTRASEÑA ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Se requiere un email.' });
    }

    // CAMBIO: Especificamos la URL exacta a la que debe redirigir Supabase.
    // Esto asegura que el usuario aterrice en la página correcta.
    const redirectTo = `${process.env.FRONTEND_URL}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
    });

    if (error) {
        console.error("Error al enviar email de restablecimiento:", error);
        // No revelamos si el email existe o no por seguridad.
        // Siempre enviamos una respuesta genérica de éxito.
    }

    res.status(200).json({ 
        message: 'Si existe una cuenta con ese email, se ha enviado un enlace para restablecer la contraseña.' 
    });
});

// --- CAMBIO: NUEVA RUTA PARA ACTUALIZAR LA CONTRASEÑA ---
router.post('/update-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Se requieren el token y la nueva contraseña.' });
    }

    // Usamos el token para identificar al usuario y actualizar su contraseña
    const { error } = await supabase.auth.updateUser(
        { password: password },
        { jwt: token } // Pasamos el token aquí para que Supabase sepa a quién actualizar
    );

    // CORRECCIÓN: El método updateUser con JWT no funciona como se espera desde el backend.
    // La forma correcta es que el frontend llame directamente a Supabase.
    // Sin embargo, para mantener la lógica en el backend, usaremos un método alternativo.
    // El frontend debe pasar el token que obtuvo de la URL.
    // El backend lo usa para obtener la identidad del usuario y luego realizar la actualización como admin.
    
    // Decodificamos el token para obtener el ID del usuario de forma segura
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    // Como administradores, actualizamos la contraseña para ese usuario específico
    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: password }
    );

    if (updateError) {
        console.error("Error al actualizar la contraseña:", updateError);
        return res.status(500).json({ error: 'No se pudo actualizar la contraseña.' });
    }

    res.status(200).json({ message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.' });
});

// RUTA PARA OBTENER DATOS DEL USUARIO
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;

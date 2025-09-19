// backend/middleware/auth.js (Versión de Depuración)
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    console.log(`[Auth Middleware] Petición recibida para: ${req.originalUrl}`); // <-- LOG 1

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Auth Middleware] RECHAZADO: No hay cabecera de autorización.');
        return res.status(401).json({ message: 'Acceso denegado. Formato de token inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        console.log('[Auth Middleware] Validando token con Supabase...'); // <-- LOG 2
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error) {
            // Si Supabase devuelve un error, lo registramos para verlo.
            console.error('[Auth Middleware] ERROR de Supabase al validar token:', error.message); // <-- LOG 3
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        
        if (!user) {
            console.log('[Auth Middleware] RECHAZADO: Token válido pero sin usuario asociado.');
            return res.status(403).json({ message: 'Token no válido.' });
        }

        console.log(`[Auth Middleware] ÉXITO: Usuario ${user.id} validado. Pasando a la ruta...`); // <-- LOG 4
        req.user = user;
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        req.supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        next();
    } catch (err) {
        console.error('[Auth Middleware] ERROR CATASTRÓFICO:', err); // <-- LOG 5
        res.status(500).json({ message: 'Error interno del servidor durante la autenticación.' });
    }
};

module.exports = authMiddleware;
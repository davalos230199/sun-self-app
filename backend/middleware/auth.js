// backend/middleware/auth.js (Versión de Depuración)
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. Formato de token inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        
        if (!user) {
            return res.status(403).json({ message: 'Token no válido.' });
        }

        req.user = user;
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        req.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
        });

        next();
    } catch (err) {
        res.status(500).json({ message: 'Error interno del servidor durante la autenticación.' });
    }
};

module.exports = authMiddleware;
const { createClient } = require('@supabase/supabase-js');

// Creamos un cliente de Supabase aquí también para validar el token
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Usamos la anon key pública, es suficiente
const supabase = createClient(supabaseUrl, supabaseKey);

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // CAMBIO CLAVE: Usamos supabase.auth.getUser() para validar el token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            // Si Supabase dice que el token es inválido, devolvemos un error
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Si el token es válido, adjuntamos el usuario al request y continuamos
        req.user = user;
        next();

    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authMiddleware;

// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        // CAMBIO: Verificamos el token localmente usando nuestro secreto.
        // No hay más llamadas a Supabase aquí.
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntamos el payload del token (que es nuestro objeto de usuario) a la solicitud.
        req.user = decodedUser;
        
        next();
    } catch (err) {
        // Si el token es inválido (firma incorrecta o expirado), devolvemos un error.
        console.error('Error de validación de JWT:', err.message);
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = authMiddleware;
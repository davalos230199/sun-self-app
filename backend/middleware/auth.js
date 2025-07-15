const { createClient } = require('@supabase/supabase-js');

// Usamos la clave de servicio para tener permiso de leer la tabla de usuarios
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó un token.' });
    }

    try {
        // --- PASO 1: Validar el token con Supabase ---
        // Esto nos confirma que el usuario está autenticado y nos da su ID de tipo UUID.
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            console.error('Error de autenticación de Supabase:', authError.message);
            return res.status(401).json({ error: 'Token inválido.' });
        }

        // --- PASO 2: Obtener el perfil completo de nuestra tabla public.users ---
        // Usamos el UUID del usuario autenticado para buscar su perfil en nuestra tabla.
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id) // Comparamos el UUID
            .single();

        if (profileError) {
            console.error('Error al buscar el perfil del usuario:', profileError.message);
            return res.status(404).json({ error: 'Perfil de usuario no encontrado.' });
        }

        // ¡ÉXITO! Adjuntamos el perfil completo (que contiene el ID numérico correcto) al request.
        // NOTA: Si tu tabla 'users' no tiene un id numérico, y el id es el UUID,
        // entonces el problema está en las funciones RPC que esperan un BIGINT.
        // Por ahora, asumimos que tu tabla 'users' tiene el id numérico que las RPCs necesitan.
        // Si el id de tu tabla 'users' es el UUID, necesitaremos cambiar el tipo en las RPCs.
        // VAMOS A ASUMIR QUE EL ID EN TU TOKEN ES EL UUID Y EL ID EN TUS RPCs ES EL NUMÉRICO.
        // El token decodificado por el antiguo middleware tenía el id numérico. El nuevo no.
        // La solución es adjuntar el perfil completo.
        
        // El objeto `userProfile` de tu tabla `public.users` es lo que tus rutas esperan.
        req.user = userProfile; 
        
        next();

    } catch (err) {
        console.error('Error inesperado en el middleware de autenticación:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = authMiddleware;

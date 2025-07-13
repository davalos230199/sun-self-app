const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- RUTA DE REGISTRO ACTUALIZADA ---
router.post('/register', async (req, res) => {
  const { email, password, nombre, apellido, apodo } = req.body;

  // CAMBIO: El apodo ahora es obligatorio
  if (!email || !password || !nombre || !apellido || !apodo) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  try {
    // Verificamos si el apodo ya existe (además de la restricción de la DB)
    const { data: apodoExistente } = await supabase
        .from('users')
        .select('apodo')
        .eq('apodo', apodo)
        .single();

    if (apodoExistente) {
        return res.status(409).json({ error: 'Ese apodo ya está en uso. Elige otro.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, nombre, apellido, apodo }])
      .select();

    if (error) {
      if (error.code === '23505') { // Error de violación de unicidad (para email)
        return res.status(409).json({ error: 'El email ya está en uso.' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ message: 'Usuario creado con éxito', user: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- RUTA DE LOGIN ACTUALIZADA ---
router.post('/login', async (req, res) => {
    // CAMBIO: Aceptamos 'identifier' que puede ser email o apodo
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Se requieren identificador y contraseña.' });
    }

    try {
        // CAMBIO: Buscamos por email O por apodo
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${identifier},apodo.eq.${identifier}`);

        if (error || !users || users.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // CAMBIO: Añadimos el apodo al token para poder usarlo en la app
        const token = jwt.sign(
          { id: user.id, email: user.email, nombre: user.nombre, apodo: user.apodo },
          process.env.JWT_SECRET, 
          { expiresIn: '24h' } // Aumentamos la duración de la sesión
        );
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// La ruta /me no cambia, ya que simplemente decodifica el token que ahora contiene el apodo.
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

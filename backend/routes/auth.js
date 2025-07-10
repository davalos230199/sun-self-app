// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth'); // <-- Ojo a la nueva ruta

// Conexión a Supabase (solo para este archivo)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// RUTA DE REGISTRO -> POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: email, password: hashedPassword }])
      .select();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'El email ya está en uso' });
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ message: 'Usuario creado con éxito', user: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA DE LOGIN -> POST /api/auth/login
router.post('/login', async (req, res) => {
    // ... (El mismo código de login que tenías)
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
    if (error || users.length === 0) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// RUTA DE VERIFICACIÓN DE SESIÓN -> GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
// backend/index.js

// =================================================================
// 1. IMPORTACIONES
// =================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const authMiddleware = require('./auth');

// =================================================================
// 2. INICIALIZACIÓN Y MIDDLEWARES
// =================================================================
const app = express();
const PORT = process.env.PORT || 4000;

// --- Conexión a servicios externos ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Middlewares globales ---
app.use(cors());
app.use(express.json());

// =================================================================
// 3. RUTAS DE LA API
// =================================================================

// --- RUTA DE HEALTH CHECK ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- RUTAS DE AUTENTICACIÓN ---

// 1. RUTA DE REGISTRO
app.post('/api/register', async (req, res) => {
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
      if (error.code === '23505') {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Usuario creado con éxito', user: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. RUTA DE LOGIN
app.post('/api/login', async (req, res) => {
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

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token });
});

// 3. RUTA DE VERIFICACIÓN DE SESIÓN
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// --- RUTAS DE REGISTROS ---

// 1. RUTA PARA CREAR UN REGISTRO
app.post('/api/registros', authMiddleware, async (req, res) => {
  console.log('>>> Petición recibida en /api/registros');
  try {
    const { id: userId } = req.user;
    const { mente, emocion, cuerpo } = req.body;

    if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
      return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
    }

    const { data, error } = await supabase.from('registros').insert([{
      user_id: userId,
      mente_estat: mente.seleccion,
      mente_coment: mente.comentario,
      emocion_estat: emocion.seleccion,
      emocion_coment: emocion.comentario,
      cuerpo_estat: cuerpo.seleccion,
      cuerpo_coment: cuerpo.comentario,
    }]);

    if (error) throw error;

    res.status(201).json({ message: 'Registro guardado con éxito', registro: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el registro' });
  }
});

// 2. RUTA PARA OBTENER TODO EL HISTORIAL DE UN USUARIO
app.get('/api/registros', authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user;
    console.log(`Buscando registros para el user_id: ${userId}`);

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error en GET /api/registros:", err);
    res.status(500).json({ error: 'Error al obtener los registros' });
  }
});

// 3. RUTA PARA VERIFICAR SI HAY REGISTRO HOY
app.get('/api/registros/today', authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const today = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      .limit(1);

    if (error) throw error;

    res.json({ registro: data.length > 0 ? data[0] : null });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar el registro de hoy' });
  }
});


// --- RUTA DEL COACH CON IA ---
app.post('/api/coach', authMiddleware, async (req, res) => {
  console.log('--- COACH API: Petición recibida en /api/coach ---');
  const { message } = req.body;
  if (!message) {
    console.log('--- COACH API: Error - El mensaje está vacío.');
    return res.status(400).json({ error: 'Se requiere un mensaje.' });
  }

  try {
    console.log(`--- COACH API: Intentando llamar a OpenAI con el mensaje: "${message}"`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Eres una conciencia-espejo...` // (Tu prompt largo y detallado va aquí)
        },
        { role: "user", content: message }
      ],
    });
    
    console.log('--- COACH API: Llamada a OpenAI exitosa.');
    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('--- COACH API: ERROR CATASTRÓFICO ---');
    console.error('El objeto de error completo es:', error);
    res.status(500).json({ error: 'No se pudo obtener una respuesta del coach.' });
  }
});


// =================================================================
// 4. INICIO DEL SERVIDOR
// =================================================================
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
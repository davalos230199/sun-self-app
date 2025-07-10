// backend/index.js

// --- CONFIGURACIÓN E IMPORTACIONES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js'); // Herramienta para conectar con Supabase
const authMiddleware = require('./auth');

// --- CONEXIÓN A LA BASE DE DATOS ---
// Usamos las variables de tu archivo .env para conectar con tu proyecto de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- INICIALIZACIÓN DE LA APP ---
const app = express();
const PORT = process.env.PORT || 4000;

// --- Configuración de OpenAI ---
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- MIDDLEWARE ---
// --- EL BACKEND NO DUERME ---
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- RUTAS DE AUTENTICACIÓN ---

// 1. RUTA DE REGISTRO (NUEVA)
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertamos el nuevo usuario en la tabla 'users' de Supabase
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


// 2. RUTA DE LOGIN (ACTUALIZADA PARA USAR LA BASE DE DATOS)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Buscamos al usuario en la base de datos por su email
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (error || users.length === 0) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const user = users[0];

  // Comparamos la contraseña enviada con la que está en la base de datos
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  // Creamos el token si todo está bien
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token });
});

// --- RUTA PROTEGIDA (SIN CAMBIOS) ---
app.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// RUTA PARA VERIFICAR SI HAY REGISTRO HOY
app.get('/api/registros/today', authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user;

    // Buscamos un registro del usuario actual que sea de hoy
    const today = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      .limit(1);

    if (error) throw error;

    // Si encontramos un registro, lo enviamos. Si no, enviamos null.
    res.json({ registro: data.length > 0 ? data[0] : null });

  } catch (err) {
    res.status(500).json({ error: 'Error al verificar el registro de hoy' });
  }
});

app.post('/api/registros', authMiddleware, async (req, res) => {
   console.log('>>> Petición recibida en /api/registros'); 
  try {
    const { id: userId } = req.user; // Obtenemos el ID del usuario desde el token
    const { mente, emocion, cuerpo } = req.body; // Recibimos el estado de los orbes

    if (!mente?.seleccion || !emocion?.seleccion || !cuerpo?.seleccion) {
      return res.status(400).json({ error: 'Se requiere la selección de todos los orbes.' });
    }

    const { data, error } = await supabase
      .from('registros')
      .insert([{
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


// RUTA PARA OBTENER TODO EL HISTORIAL DE UN USUARIO
app.get('/api/registros', authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user; // Obtenemos el ID del usuario del token
    // Esto nos mostrará en los logs de Render qué ID está buscando.
    console.log(`Buscando registros para el user_id: ${userId}`);
    // --------------------

    // Buscamos todos los registros del usuario
    const { data, error } = await supabase
      .from('registros')
      .select('*') // Seleccionamos todas las columnas
      .eq('user_id', userId) // Solo del usuario que hace la petición
      .order('created_at', { ascending: false }); // Ordenados del más nuevo al más viejo

    if (error) throw error;

    res.json(data); // Enviamos el array de registros

  } catch (err) {
    // Añadimos un log para ver el error en Render si algo falla
    console.error("Error en GET /api/registros:", err);
    res.status(500).json({ error: 'Error al obtener los registros' });
  }
});

// --- RUTA PARA HABLAR CON EL COACH ---
app.post('/api/coach', authMiddleware, async (req, res) => {
  // Log de Entrada: ¿Llegó la petición?
  console.log('--- COACH API: Petición recibida en /api/coach ---');

  const { message } = req.body;

  if (!message) {
    console.log('--- COACH API: Error - El mensaje está vacío.');
    return res.status(400).json({ error: 'Se requiere un mensaje.' });
  }

  try {
    // Log de Intento: ¿Estamos a punto de llamar a OpenAI?
    console.log(`--- COACH API: Intentando llamar a OpenAI con el mensaje: "${message}"`);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un coach de vida empático y perspicaz llamado Sun-Self. Ayudas a los usuarios a explorar sus sentimientos basándote en un sistema de 'orbes' (mente, emoción, cuerpo). Tu tono es cálido, maduro y un poco 'ñoño', como un diario íntimo. No das consejos directos, haces preguntas que invitan a la reflexión." },
        { role: "user", content: message }
      ],
    });

    // Log de Éxito: Si llegamos aquí, OpenAI respondió bien.
    console.log('--- COACH API: Llamada a OpenAI exitosa.');
    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    // Log de Fallo: ¿Qué rompió exactamente?
    console.error('--- COACH API: ERROR CATASTRÓFICO ---');
    console.error('El objeto de error completo es:', error); // Logueamos el error completo
    res.status(500).json({ error: 'No se pudo obtener una respuesta del coach.' });
  }
});

// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});


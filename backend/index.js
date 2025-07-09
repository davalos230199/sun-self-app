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

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

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

// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});








/*// Cargamos variables del archivo .env
require('dotenv').config();

// Importamos los módulos necesarios
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Middleware de autenticación para rutas protegidas
const authMiddleware = require('./auth');


// Inicializamos la app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Permite que el frontend se conecte
app.use(express.json()); // Para leer JSON en el body de los requests

// Usuario hardcodeado (como si viniera de una base de datos)
const users = [
  {
    id: 1,
    username: 'danilo',
    password: bcrypt.hashSync('1234', 8) // Contraseña hasheada
  }
];

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

  // Creamos un token si está todo ok
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token });
});


// Ruta protegida de ejemplo
app.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
*/
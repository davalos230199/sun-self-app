// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// --- CLAVE: CONFIGURACIÓN DE CORS CORREGIDA ---
// Le decimos explícitamente a nuestro servidor que permita
// la nueva cabecera 'x-client-timezone' en TODAS las rutas.
// También mantenemos las cabeceras estándar como Authorization.
app.use(cors({
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-timezone']
}));

app.use(express.json());

// --- RUTAS DE LA API ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const authRoutes = require('./routes/auth');
const registrosRoutes = require('./routes/registros');
const sunnyRoutes = require('./routes/sunny');

app.use('/api/auth', authRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/sunny', sunnyRoutes);

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

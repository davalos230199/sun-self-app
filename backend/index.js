// backend/index.js

// =================================================================
// 1. IMPORTACIONES
// =================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// =================================================================
// 2. INICIALIZACIÓN Y MIDDLEWARES
// =================================================================
const app = express();
const PORT = process.env.PORT || 4000;

// --- CLAVE: CONFIGURACIÓN DE CORS CORREGIDA ---
// Le decimos explícitamente a nuestro servidor que permita
// la nueva cabecera 'X-Timezone-Offset' en TODAS las rutas.
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Timezone-Offset']
}));

app.use(express.json());

// =================================================================
// 3. RUTAS DE LA API (La Centralita)
// =================================================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- CONEXIÓN A LOS DEPARTAMENTOS (ARCHIVOS DE RUTAS) ---
const authRoutes = require('./routes/auth');
const registrosRoutes = require('./routes/registros');
const sunnyRoutes = require('./routes/sunny');

app.use('/api/auth', authRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/sunny', sunnyRoutes);

// =================================================================
// 4. INICIO DEL SERVIDOR
// =================================================================
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

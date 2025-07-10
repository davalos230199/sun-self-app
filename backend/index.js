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

// Middlewares globales
app.use(cors());
app.use(express.json());

// =================================================================
// 3. RUTAS DE LA API (La Centralita)
// =================================================================

// --- RUTA DE HEALTH CHECK ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- CONEXIÓN A LOS DEPARTAMENTOS (ARCHIVOS DE RUTAS) ---
const authRoutes = require('./routes/auth');
const registrosRoutes = require('./routes/registros');
const coachRoutes = require('./routes/coach'); // <-- La última pieza

app.use('/api/auth', authRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/coach', coachRoutes); // <-- Conectada

// =================================================================
// 4. INICIO DEL SERVIDOR
// =================================================================
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

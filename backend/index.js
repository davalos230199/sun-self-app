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

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-timezone']
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
const inspiracionRoutes = require('./routes/inspiracion'); // <-- CAMBIO: Importamos la nueva ruta
const muroRoutes = require('./routes/muro');
const minimetasRouter = require('./routes/minimetas'); // <--- 1. Importa el nuevo router

app.use('/api/auth', authRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/sunny', sunnyRoutes);
app.use('/api/inspiracion', inspiracionRoutes); // <-- CAMBIO: Le decimos a Express que use la nueva ruta
app.use('/api/muro', muroRoutes);
app.use('/api/minimetas', minimetasRouter); // <--- 2. Dile a Express que lo use

// =================================================================
// 4. INICIO DEL SERVIDOR
// =================================================================
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

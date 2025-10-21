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

// --- CAMBIO: Configuración de CORS robusta ---
const whiteList = [process.env.FRONTEND_URL]; // La lista de invitados
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            // Permite la URL de la whitelist y peticiones sin origen (ej. Postman)
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }   
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-timezone']
};

app.use(cors(corsOptions)); // Usamos la nueva configuración

app.use(express.json());

// =================================================================
// 3. RUTAS DE LA API (La Centralita)
// =================================================================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// --- CONEXIÓN A LOS DEPARTAMENTOS (ARCHIVOS DE RUTAS) ---
const registrosRoutes = require('./routes/registros');
const diarioRoutes = require('./routes/diario');
const sunnyRoutes = require('./routes/sunny');
const metasRouter = require('./routes/metas');
const muroRoutes = require('./routes/muro');
const botRoutes = require('./routes/bot.js');


app.use('/api/sunny', sunnyRoutes);
app.use('/api/muro', muroRoutes);
app.use('/api/metas', metasRouter);
app.use('/api/bot', botRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/diario', diarioRoutes);

// =================================================================
// 4. INICIO DEL SERVIDOR
// =================================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Sun Self corriendo en el puerto tal ${PORT}`);
});
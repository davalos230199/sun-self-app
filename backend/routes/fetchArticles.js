// backend/routes/bot.js

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Creamos el cliente de Supabase (igual que en su 'middleware/auth.js')
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ¡Clave! Usar la Service Key
);

// El "Manantial"
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Las categorías (las últimas que probamos)
const KEYWORDS_POR_CATEGORIA = [
  { categoria: 'Mente', q: '"salud mental" OR ansiedad OR estres OR bienestar mental' },
  { categoria: 'Cuerpo', q: 'nutricion OR ejercicio OR sedentarismo OR "calidad de sueño" OR alimentacion' },
  { categoria: 'Emoción', q: '"inteligencia emocional" OR empatia OR "bienestar emocional"' }
];

// POST /api/run-fetch-job
// (Usamos POST para que sea más difícil de invocar por accidente)
router.post('/run-fetch-job', async (req, res) => {
  // --- AÑADIMOS SEGURIDAD ---
  // Verificamos un "bearer token" secreto para que solo el "Despertador" lo ejecute
const authHeader = req.headers['authorization']; // Esto leerá "jobcito-de-noticias"

if (authHeader !== process.env.CRON_JOB_SECRET) {
    console.warn('Intento de ejecución de Job SIN token secreto.');
    return res.status(401).json({ error: 'No autorizado' });
  }

  // --- INICIO DE LA LÓGICA DEL BOT ---
  console.log('Iniciando búsqueda de artículos (Job)...');
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

  if (!NEWSAPI_KEY) {
    console.error('CRON JOB ERROR: NEWSAPI_KEY no encontrada.');
    return res.status(500).json({ error: 'NEWSAPI_KEY no configurada' });
  }

  let totalArticulosInsertados = 0;

  try {
    for (const item of KEYWORDS_POR_CATEGORIA) {
      const params = {
        apiKey: NEWSAPI_KEY,
        language: 'es',
        domains: 'infobae.com,clarin.com,lanacion.com.ar',
        q: item.q,
        pageSize: 5,
        sortBy: 'publishedAt'
      };

      const response = await axios.get(NEWS_API_URL, { params });
      const articles = response.data.articles;

      if (!articles || articles.length === 0) {
        console.log(`Job: No se encontraron artículos para ${item.categoria}`);
        continue;
      }

      const articulosParaInsertar = articles
        .filter(article => article.title && article.url && article.description)
        .map(article => ({
          titulo: article.title,
          descripcion: article.description,
          url_fuente: article.url,
          url_imagen: article.urlToImage,
          fuente_nombre: article.source.name,
          fecha_publicacion: article.publishedAt,
          categoria: item.categoria
        }));

      const { error, count } = await supabase
        .from('articulos_bienestar')
        .insert(articulosParaInsertar, { onConflict: 'url_fuente' });

      if (error) {
        console.error(`Job Error (Supabase): ${error.message}`);
      } else {
        console.log(`Job: Éxito para ${item.categoria}. Artículos procesados: ${count ?? 0}`);
        totalArticulosInsertados += (count ?? 0);
      }
    }

    console.log('Job finalizado. Total de artículos nuevos insertados:', totalArticulosInsertados);
    return res.status(200).json({ 
      message: 'Job ejecutado exitosamente.', 
      nuevos_articulos: totalArticulosInsertados 
    });

  } catch (err) {
    console.error('Error inesperado en el Job:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
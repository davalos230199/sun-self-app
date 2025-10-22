// backend/routes/fetchArticles.js (v3 - Volvemos a NewsAPI)

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Cliente de Supabase (sin cambios)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// El "Manantial" 1.0 (El que funcionaba)
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Las categorías (sin cambios)
const KEYWORDS_POR_CATEGORIA = [
  { categoria: 'Mente', q: '"salud mental" OR ansiedad OR estres OR bienestar mental OR meditación OR psicología' },
  { categoria: 'Cuerpo', q: 'nutrición OR ejercicio OR sedentarismo OR "calidad de sueño" OR alimentación OR físico' },
  { categoria: 'Emoción', q: '"inteligencia emocional" OR empatía OR "bienestar emocional" OR relaciones' }
];

// --- EL NUEVO FILTRO ANTI-BASURA ---
const TERMINOS_EXCLUIDOS = ' NOT política NOT deportes NOT fútbol NOT farándula NOT horóscopo NOT crimen NOT finanzas';


router.post('/run-fetch-job', async (req, res) => {
  // Seguridad (sin cambios)
  const authHeader = req.headers['authorization'];
  if (authHeader !== process.env.CRON_JOB_SECRET) {
    console.warn('Intento de ejecución de Job SIN token secreto.');
    return res.status(401).json({ error: 'No autorizado' });
  }

  // --- INICIO DE LA LÓGICA v3 ---
  console.log('Iniciando búsqueda de artículos (Job v3 - NewsAPI)...');
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

  if (!NEWSAPI_KEY) {
    console.error('CRON JOB ERROR: NEWSAPI_KEY no encontrada.');
    return res.status(500).json({ error: 'NEWSAPI_KEY no configurada' });
  }

  let totalArticulosInsertados = 0;

  try {
    for (const item of KEYWORDS_POR_CATEGORIA) {
      
      // --- EL FILTRO DE CALIDAD (v3) ---
      const params = {
        apiKey: NEWSAPI_KEY,
        language: 'es',
        q: item.q + TERMINOS_EXCLUIDOS, // <-- 1. AÑADIMOS EXCLUSIONES
        searchIn: 'title',              // <-- 2. TU IDEA: BUSCAR SOLO EN TÍTULO
        pageSize: 5,                    // <-- 3. ARREGLO: LÍMITE DE 5
        sortBy: 'publishedAt'
        // 'domains' está ELIMINADO: ahora buscamos en blogs de salud, no solo en diarios.
      };
      // --- FIN DEL FILTRO ---

      const response = await axios.get(NEWS_API_URL, { params });
      const articles = response.data.articles;

      if (!articles || articles.length === 0) {
        console.log(`Job v3: No se encontraron artículos para ${item.categoria}`);
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

      // Insertamos en Supabase (con el 'count' arreglado)
      const { error, count } = await supabase
        .from('articulos_bienestar')
        .insert(articulosParaInsertar, { 
          onConflict: 'url_fuente',
          count: 'exact' // <-- 4. ARREGLO: EL CONTADOR
        });

      if (error) {
        console.error(`Job v3 Error (Supabase): ${error.message}`);
      } else {
        console.log(`Job v3: Éxito para ${item.categoria}. Artículos procesados: ${count ?? 0}`);
        totalArticulosInsertados += (count ?? 0);
      }
    }

    console.log('Job v3 finalizado. Total de artículos nuevos insertados:', totalArticulosInsertados);
    return res.status(200).json({ 
      message: 'Job v3 ejecutado exitosamente.', 
      nuevos_articulos: totalArticulosInsertados 
    });

  } catch (err) {
    console.error('Error inesperado en el Job v3:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
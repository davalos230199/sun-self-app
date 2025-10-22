// backend/routes/fetchArticles.js (v5 - Everything + Whitelist)

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Cliente de Supabase (sin cambios)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Manantial v1 (el que funciona)
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Categorías (sin cambios)
const KEYWORDS_POR_CATEGORIA = [
  { categoria: 'Mente', q: '"salud mental" OR ansiedad OR estres OR bienestar mental OR meditación OR psicología' },
  { categoria: 'Cuerpo', q: 'nutrición OR ejercicio OR sedentarismo OR "calidad de sueño" OR alimentación OR físico' },
  { categoria: 'Emoción', q: '"inteligencia emocional" OR empatía OR "bienestar emocional" OR relaciones' }
];

// --- EL FILTRO DE DOMINIOS (v5) ---
// Apuntamos SOLO a sitios de salud y bienestar en español
const DOMAINS_WHITELIST = 'cuidateplus.marca.com,webconsultas.com,mayoclinic.org,medlineplus.gov,infosalus.com,who.int/es';


router.post('/run-fetch-job', async (req, res) => {
  // Seguridad (sin cambios)
  const authHeader = req.headers['authorization'];
  if (authHeader !== process.env.CRON_JOB_SECRET) {
    console.warn('Intento de ejecución de Job SIN token secreto.');
    return res.status(401).json({ error: 'No autorizado' });
  }

  console.log('Iniciando búsqueda de artículos (Job v5 - Whitelist)...');
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

  if (!NEWSAPI_KEY) {
    console.error('CRON JOB ERROR: NEWSAPI_KEY no encontrada.');
    return res.status(500).json({ error: 'NEWSAPI_KEY no configurada' });
  }

  let totalArticulosInsertados = 0;

  try {
    for (const item of KEYWORDS_POR_CATEGORIA) {
      
      // --- EL FILTRO DE CALIDAD (v5) ---
      const params = {
        apiKey: NEWSAPI_KEY,
        language: 'es',
        q: item.q,
        domains: DOMAINS_WHITELIST, // <-- 1. FILTRO DE SITIOS PUROS
        searchIn: 'title',          // <-- 2. FILTRO ANTI-BASURA
        pageSize: 5,                // <-- 3. LÍMITE
        sortBy: 'publishedAt'
      };
      // --- FIN DEL FILTRO ---

      const response = await axios.get(NEWS_API_URL, { params });
      const articles = response.data.articles;

      if (!articles || articles.length === 0) {
        console.log(`Job v5: No se encontraron artículos para ${item.categoria} en los dominios permitidos.`);
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
        .insert(articulosParaInsertar, { 
          onConflict: 'url_fuente',
          count: 'exact'
        });

      if (error) {
        console.error(`Job v5 Error (Supabase): ${error.message}`);
      } else {
        const insertados = count ?? 0;
        console.log(`Job v5: Éxito para ${item.categoria}. Artículos nuevos: ${insertados}`);
        totalArticulosInsertados += insertados;
      }
    }

    console.log('Job v5 finalizado. Total de artículos nuevos insertados:', totalArticulosInsertados);
    return res.status(200).json({ 
      message: 'Job v5 ejecutado exitosamente.', 
      nuevos_articulos: totalArticulosInsertados 
    });

  } catch (err) {
    console.error('Error inesperado en el Job v5:', err.message);
    if (err.response) { // Más logs de depuración
      console.error('Error Data:', err.response.data);
      console.error('Error Status:', err.response.status);
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
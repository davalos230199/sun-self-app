// backend/routes/fetchArticles.js (v3 - Volvemos a NewsAPI)

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'; // <-- ¡EL ENDPOINT CORRECTO!
const KEYWORDS = {
  Mente: /mental|cerebro|ansiedad|estrés|depresión|psicolog|medita|bienestar mental/,
  Cuerpo: /ejercicio|nutrición|alimentación|sueño|físico|cuerpo|dieta|sedentarismo/,
  Emoción: /emocional|emocion|empatía|sentimientos|relaciones|inteligencia emocional/
};

function categorizeArticle(title) {
  if (!title) return 'Bienestar'; // Categoría por defecto si el título es nulo
  const lowerTitle = title.toLowerCase();
  if (KEYWORDS.Mente.test(lowerTitle)) return 'Mente';
  if (KEYWORDS.Cuerpo.test(lowerTitle)) return 'Cuerpo';
  if (KEYWORDS.Emoción.test(lowerTitle)) return 'Emoción';
  return 'Bienestar'; // Si no coincide, categoría general
}

router.post('/run-fetch-job', async (req, res) => {
  
  console.log('Iniciando búsqueda de artículos (Job v4 - Top-Headlines)...');
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

  if (!NEWSAPI_KEY) {
    console.error('CRON JOB ERROR: NEWSAPI_KEY no encontrada.');
    return res.status(500).json({ error: 'NEWSAPI_KEY no configurada' });
  }

  let totalArticulosInsertados = 0;

  try {
    // --- EL FILTRO DE CALIDAD (v4) ---
    // ¡Usamos la estrategia correcta!
    const params = {
      apiKey: NEWSAPI_KEY,
      country: 'ar',     // <-- 1. ¡ARGENTINA!
      category: 'health',  // <-- 2. ¡CATEGORÍA SALUD!
      pageSize: 20       // <-- 3. Traemos los 20 titulares de salud más recientes
    };
    // --- FIN DEL FILTRO ---

    const response = await axios.get(NEWS_API_URL, { params });
    const articles = response.data.articles;

    if (!articles || articles.length === 0) {
      console.log(`Job v4: No se encontraron artículos de salud en Argentina.`);
      return res.status(200).json({ message: 'Job ejecutado, no se encontraron artículos.', nuevos_articulos: 0 });
    }

    console.log(`Job v4: Encontrados ${articles.length} artículos de Salud en Argentina.`);

    const articulosParaInsertar = articles
      .filter(article => article.title && article.url && article.description)
      .map(article => ({
        titulo: article.title,
        descripcion: article.description,
        url_fuente: article.url,
        url_imagen: article.urlToImage,
        fuente_nombre: article.source.name,
        fecha_publicacion: article.publishedAt,
        categoria: categorizeArticle(article.title) // <-- Usamos nuestro filtro interno
      }));

    // Insertamos en Supabase (con el 'count' arreglado)
    const { error, count } = await supabase
      .from('articulos_bienestar')
      .insert(articulosParaInsertar, { 
        onConflict: 'url_fuente',
        count: 'exact'
      });

    if (error) {
      console.error(`Job v4 Error (Supabase): ${error.message}`);
    } else {
      totalArticulosInsertados = count ?? 0;
      console.log(`Job v4: Éxito. Artículos nuevos insertados: ${totalArticulosInsertados}`);
    }

    console.log('Job v4 finalizado.');
    return res.status(200).json({ 
      message: 'Job v4 ejecutado exitosamente.', 
      nuevos_articulos: totalArticulosInsertados 
    });

  } catch (err) {
    console.error('Error inesperado en el Job v4:', err.message);
    
    // --- Log de depuración para errores de API ---
    if (err.response) {
      console.error('Error Data:', err.response.data);
      console.error('Error Status:', err.response.status);
    }
    // --- Fin del log ---

    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
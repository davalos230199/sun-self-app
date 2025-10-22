// backend/routes/fetchArticles.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser'); // <--- NUEVA HERRAMIENTA
const router = express.Router();

// Cliente de Supabase (sin cambios)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Usamos el Tópico de Salud Global (que SÍ tiene RSS)
// pero le pedimos las noticias de Argentina (gl=AR y ceid=AR)
const GOOGLE_NEWS_RSS_URL = 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3N3ZDNvU0VnSmplZ0Fv?hl=es-419&gl=US&ceid=US:es-419';
const parser = new Parser();

// --- NUEVO: El "Filtro" de Categorías ---
// Palabras clave para clasificar el agua pura que traemos
const KEYWORDS = {
  Mente: /mental|cerebro|ansiedad|estrés|depresión|psicolog|medita|bienestar mental/,
  Cuerpo: /ejercicio|nutrición|alimentación|sueño|físico|cuerpo|dieta|sedentarismo/,
  Emoción: /emocional|emocion|empatía|sentimientos|relaciones|inteligencia emocional/
};

function categorizeArticle(title) {
  const lowerTitle = title.toLowerCase();
  if (KEYWORDS.Mente.test(lowerTitle)) return 'Mente';
  if (KEYWORDS.Cuerpo.test(lowerTitle)) return 'Cuerpo';
  if (KEYWORDS.Emoción.test(lowerTitle)) return 'Emoción';
  return null; // Si no coincide, lo descartamos
}

// Función para extraer la imagen del contenido HTML (Google RSS)
function extractImageUrl(content) {
  const match = content.match(/<img src="([^"]+)"/);
  return match ? match[1] : null;
}
// --- FIN DEL FILTRO ---


// La ruta (sin cambios)
router.post('/run-fetch-job', async (req, res) => {
  // Seguridad (sin cambios)
  const authHeader = req.headers['authorization'];
  if (authHeader !== process.env.CRON_JOB_SECRET) {
    console.warn('Intento de ejecución de Job SIN token secreto.');
    return res.status(401).json({ error: 'No autorizado' });
  }

  // --- INICIO DE LA NUEVA LÓGICA ---
  console.log('Iniciando búsqueda de artículos (Job v2 - Google News RSS)...');
  let articulosParaInsertar = [];

  try {
    const feed = await parser.parseURL(GOOGLE_NEWS_RSS_URL);
    
    for (const item of feed.items) {
      const categoria = categorizeArticle(item.title);

      // Si el artículo no coincide con nuestras categorías, lo ignoramos
      if (!categoria) {
        continue;
      }

      // Mapeamos el artículo del feed a nuestra tabla
      articulosParaInsertar.push({
        titulo: item.title,
        descripcion: item.contentSnippet,
        url_fuente: item.link,
        url_imagen: extractImageUrl(item.content), // Usamos nuestra nueva función
        fuente_nombre: item.creator || item.title.split(' - ').pop(), // El 'creator' a veces viene, si no, intentamos sacarlo del título
        fecha_publicacion: item.isoDate,
        categoria: categoria
      });
    }

    if (articulosParaInsertar.length === 0) {
      console.log('Job v2: No se encontraron artículos nuevos que coincidan con los filtros.');
      return res.status(200).json({ 
        message: 'Job ejecutado, no se encontraron artículos nuevos.', 
        nuevos_articulos: 0 
      });
    }

    // Insertamos en Supabase (con el 'count: exact' que ya arreglamos)
    const { error, count } = await supabase
      .from('articulos_bienestar')
      .insert(articulosParaInsertar, { 
        onConflict: 'url_fuente',
        count: 'exact'
      });

    if (error) {
      console.error(`Job v2 Error (Supabase): ${error.message}`);
      // No devolvemos 500, porque el error puede ser solo un 'duplicate key'
    }

    const articulosInsertados = count ?? 0;
    console.log(`Job v2 finalizado. Total de artículos nuevos insertados: ${articulosInsertados}`);
    return res.status(200).json({ 
      message: 'Job v2 ejecutado exitosamente.', 
      nuevos_articulos: articulosInsertados
    });

  } catch (err) {
    console.error('Error inesperado en el Job v2:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
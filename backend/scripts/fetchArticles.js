// backend/scripts/fetchArticles.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // ¡Usar la Service Key!
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const GNEWS_API = 'https://gnews.io/api/v4/search';

const KEYWORDS_POR_CATEGORIA = [
  { categoria: 'Mente', q: '"salud mental" OR ansiedad OR depresion OR meditacion OR cerebro' },
  { categoria: 'Cuerpo', q: 'sedentarismo OR nutricion OR ejercicio OR "calidad de sueño" OR hidratacion' },
  { categoria: 'Emoción', q: '"inteligencia emocional" OR empatia OR "relaciones sociales"' }
];

async function fetchAndStoreArticles() {
  console.log('Iniciando job de búsqueda de artículos...');
  
  for (const item of KEYWORDS_POR_CATEGORIA) {
    try {
      const response = await axios.get(GNEWS_API, {
        params: {
          q: item.q,
          lang: 'es', // Buscar solo en español
          max: 5,     // Traer 5 artículos por categoría
          token: GNEWS_API_KEY
        }
      });

      const articles = response.data.articles;
      if (!articles) continue;

      const articulosParaInsertar = articles.map(article => ({
        titulo: article.title,
        descripcion: article.description,
        url_fuente: article.url,
        url_imagen: article.image,
        fuente_nombre: article.source.name,
        fecha_publicacion: article.publishedAt,
        categoria: item.categoria
      }));

      // Insertar en Supabase, ignorando duplicados (gracias a 'url_fuente' UNIQUE)
      const { error } = await supabase
        .from('articulos_bienestar')
        .insert(articulosParaInsertar, { onConflict: 'url_fuente' });

      if (error) {
        console.error(`Error insertando en Supabase para ${item.categoria}:`, error.message);
      } else {
        console.log(`Artículos de ${item.categoria} insertados exitosamente.`);
      }

    } catch (err) {
      console.error('Error llamando a GNews API:', err.message);
    }
  }
  console.log('Job de búsqueda de artículos finalizado.');
}

// Ejecutar la función
fetchAndStoreArticles();
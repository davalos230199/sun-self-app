// supabase/functions/fetch-articles/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Estos son los encabezados para permitir que la función sea llamada (si es necesario)
// y para manejar correctamente el JSON.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Content-Type': 'application/json'
}

// URL de la API de Noticias (el "Manantial")
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'

// Definimos las búsquedas. country=ar (Argentina) y category=health (Salud) son fijos.
// Cambiamos 'q' (palabra clave) para cada categoría.
const KEYWORDS_POR_CATEGORIA = [
  { categoria: 'Mente', q: '"salud mental" OR ansiedad OR estres OR bienestar mental' },
  { categoria: 'Cuerpo', q: 'nutricion OR ejercicio OR sedentarismo OR "calidad de sueño" OR alimentacion' },
  { categoria: 'Emoción', q: '"inteligencia emocional" OR empatia OR "bienestar emocional"' }
]

console.log('Función "fetch-articles" inicializada.');

serve(async (req) => {
  // 1. Verificamos si es una llamada 'OPTIONS' (pre-vuelo de CORS), la manejamos.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Obtenemos los Secretos (la API Key de NewsAPI)
    // Deno.env.get() accede a los "Secrets" que guardó en el dashboard.
    const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY')
    if (!NEWSAPI_KEY) {
      throw new Error('NEWSAPI_KEY no encontrada en los Secrets.')
    }

    // 3. Creamos el cliente de Supabase
    // Usamos las variables de entorno de Supabase (automáticamente disponibles)
    // Usamos 'service_role' para poder escribir en la DB desde el servidor.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let totalArticulosInsertados = 0;
    console.log('Iniciando búsqueda de artículos...');

    // 4. Iteramos sobre cada categoría (Mente, Cuerpo, Emoción)
    for (const item of KEYWORDS_POR_CATEGORIA) {
      const params = new URLSearchParams({
        apiKey: NEWSAPI_KEY,
        country: 'ar',
        category: 'health',
        q: item.q,
        pageSize: '5' // Traer 5 artículos por categoría
      })

      // 5. Llamamos a la API de Noticias (el "Manantial")
      const response = await fetch(`${NEWS_API_URL}?${params}`)
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Error de NewsAPI para ${item.categoria}:`, errorData.message)
        continue // Salta a la siguiente categoría si esta falla
      }

      const data = await response.json()
      const articles = data.articles

      if (!articles || articles.length === 0) {
        console.log(`No se encontraron artículos para ${item.categoria}`)
        continue
      }

      // 6. Formateamos los artículos para nuestra "Cisterna" (Tabla)
      const articulosParaInsertar = articles
        .filter(article => article.title && article.url && article.description) // Filtramos artículos incompletos
        .map(article => ({
          titulo: article.title,
          descripcion: article.description,
          url_fuente: article.url,
          url_imagen: article.urlToImage,
          fuente_nombre: article.source.name,
          fecha_publicacion: article.publishedAt,
          categoria: item.categoria
        }))

      // 7. Insertamos en Supabase, ignorando duplicados (gracias a 'url_fuente' UNIQUE)
      const { error, count } = await supabase
        .from('articulos_bienestar')
        .insert(articulosParaInsertar, { onConflict: 'url_fuente' }) // Clave: no duplicar

      if (error) {
        console.error(`Error insertando en Supabase para ${item.categoria}:`, error.message)
      } else {
        console.log(`Éxito para ${item.categoria}. Artículos procesados: ${count ?? 0}`)
        totalArticulosInsertados += (count ?? 0)
      }
    } // Fin del bucle

    console.log('Job finalizado. Total de artículos nuevos insertados:', totalArticulosInsertados);

    // 8. Devolvemos una respuesta exitosa
    return new Response(JSON.stringify({ 
      message: 'Job ejecutado exitosamente.', 
      nuevos_articulos: totalArticulosInsertados 
    }), {
      headers: { ...corsHeaders },
      status: 200,
    })

  } catch (err) {
    // 9. Manejamos errores inesperados
    console.error('Error inesperado en la función:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders },
      status: 500,
    })
  }
})
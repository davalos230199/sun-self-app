// frontend/src/pages/Landing.jsx
// Versión 3: "El Hub de Bienestar" (Conectado a Supabase)

import React, { useState, useEffect } from 'react'; // Importamos useEffect
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // ¡Importante! Asegurate que la ruta a tu cliente sea correcta

// --- COMPONENTE DE TARJETA ---
// (Este componente no cambia)
const ArticleCard = ({ article }) => (
  <motion.div 
    className="bg-white rounded-2xl shadow-lg overflow-hidden"
    whileHover={{ y: -5, shadow: 'xl' }}
  >
    {/* Si no hay imagen, mostramos un placeholder genérico */}
    <div 
      className="h-48 bg-cover bg-center bg-zinc-200" 
      style={{ backgroundImage: `url(${article.url_imagen || 'https://via.placeholder.com/400x300/f0f0f0/AAAAAA?text=Sun+Self'})` }}
    />
    <div className="p-6">
      <span className={`text-sm font-bold ${
          article.categoria === 'Mente' ? 'text-blue-500' 
        : article.categoria === 'Cuerpo' ? 'text-green-500' 
        : article.categoria === 'Emoción' ? 'text-yellow-500' 
        : 'text-zinc-400'
      }`}>
        {article.categoria.toUpperCase()}
      </span>
      <h3 className="text-xl font-bold text-zinc-800 mt-2 mb-3 font-['Patrick_Hand']">
        {article.titulo}
      </h3>
      <p className="text-zinc-600 text-base mb-4 line-clamp-3"> {/* line-clamp-3 limita a 3 líneas */}
        {article.descripcion}
      </p>
      <a 
        href={article.url_fuente} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-semibold text-orange-600 hover:text-orange-800"
      >
        Leer más →
      </a>
    </div>
  </motion.div>
);

// --- COMPONENTE PRINCIPAL ---
export default function Landing() {
  const [filter, setFilter] = useState('Todos'); // Estado para el filtro
  const [articles, setArticles] = useState([]); // ¡NUEVO! Estado para guardar artículos
  const [loading, setLoading] = useState(true); // ¡NUEVO! Estado de carga

  // --- ¡NUEVO! useEffect para cargar datos de Supabase ---
  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      
      let query = supabase
        .from('articulos_bienestar')
        .select('*')
        .order('fecha_publicacion', { ascending: false }) // Mostrar más nuevos primero
        .limit(12); // Traer los últimos 12

      // Si el filtro NO es "Todos", filtramos por categoría
      if (filter !== 'Todos') {
        query = query.eq('categoria', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al cargar artículos:', error);
      } else {
        setArticles(data);
      }
      setLoading(false);
    }

    fetchArticles();
  }, [filter]); // ¡IMPORTANTE! El array se recarga cuando 'filter' cambia

  // --- El NavLink no cambia ---
  const NavLink = ({ children, category }) => (
    <button
      onClick={() => setFilter(category)}
      className={`py-2 px-4 rounded-full font-['Patrick_Hand'] text-lg transition-colors
        ${filter === category ? 'bg-orange-100 text-orange-600' : 'text-zinc-600 hover:bg-zinc-100'}`}
    >
      {children}
    </button>
  );

  return (
        <div className="bg-zinc-50 min-h-screen">
            
            {/* --- Navbar (MODIFICADA) --- */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
                <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
                    <div className="flex items-center space-x-8">
                        <span className="font-['Patrick_Hand'] text-3xl font-bold text-orange-600">
                            Sun Self
                        </span>
                        <div className="hidden md:flex items-center space-x-2">
                            <NavLink category="Todos">Todos</NavLink>
                            <NavLink category="Mente">Mente</NavLink>
                            <NavLink category="Cuerpo">Cuerpo</NavLink>
                            <NavLink category="Emoción">Emoción</NavLink>
                        </div>
                    </div>
                    {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/" // <-- NUEVA RUTA
                            className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600"
                        >
                            Inicio
                        </Link>
                        <Link 
                            to="/login"
                            className="bg-orange-500 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                        >
                            Ingresar a la App
                        </Link>
                    </div>
                    {/* --- FIN DEL CAMBIO --- */}
                </nav>
            </header>

            {/* --- Contenido Principal (El Feed) --- */}
            <main className="max-w-7xl mx-auto p-8 mt-4">
                <h1 className="text-4xl font-bold text-zinc-800 mb-2">Tu Rincón de Bienestar</h1>
                <p className="text-xl text-zinc-600 mb-8 font-['Patrick_Hand']">
                    Artículos y noticias curadas para tu mente, cuerpo y emoción.
                </p>

                {/* --- Grid de Artículos --- */}
                {loading ? (
                    <p className="text-center text-zinc-500">Cargando artículos...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
                
                {(!loading && articles.length === 0) && (
                    <p className="text-center text-zinc-500">No se encontraron artículos para esta categoría.</p>
                )}
            </main>

            {/* --- Footer (No cambia) --- */}
            <footer className="text-center p-10 mt-12 bg-white border-t border-zinc-100">
                <p className="text-zinc-500 text-base font-['Patrick_Hand']">
                    {new Date().getFullYear()} Sun Self. Un movimiento por la calma.
                </p>
            </footer>
        </div>
    );
}
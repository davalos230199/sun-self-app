// frontend/src/pages/Landing.jsx
// Versión 2: "El Hub de Bienestar" (con datos de ejemplo)

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- COMPONENTE DE EJEMPLO ---
// Este componente simula una tarjeta de artículo
const ArticleCard = ({ article }) => (
  <motion.div 
    className="bg-white rounded-2xl shadow-lg overflow-hidden"
    whileHover={{ y: -5, shadow: 'xl' }}
  >
    <div 
      className="h-48 bg-cover bg-center" 
      style={{ backgroundImage: `url(${article.url_imagen})` }}
    />
    <div className="p-6">
      <span className={`text-sm font-bold ${article.categoria === 'Mente' ? 'text-blue-500' : article.categoria === 'Cuerpo' ? 'text-green-500' : 'text-yellow-500'}`}>
        {article.categoria.toUpperCase()}
      </span>
      <h3 className="text-xl font-bold text-zinc-800 mt-2 mb-3 font-['Patrick_Hand']">
        {article.titulo}
      </h3>
      <p className="text-zinc-600 text-base mb-4">
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

// --- DATOS DE EJEMPLO (Simulación de Supabase) ---
const mockArticles = [
  { id: 1, categoria: 'Cuerpo', titulo: 'El sedentarismo envejece: consecuencias de no moverse para el cerebro', descripcion: 'Nuevos estudios revelan cómo la falta de actividad física impacta directamente en la salud cognitiva...', url_fuente: 'https://www.infobae.com/salud/ciencia/2025/10/21/el-sedentarismo-envejece-cuales-son-las-consecuencias-de-no-moverse-para-el-cerebro/', url_imagen: 'https://www.infobae.com/new-resizer/ejemplo-imagen.jpg', fuente_nombre: 'Infobae' },
  { id: 2, categoria: 'Mente', titulo: 'Ansiedad: 3 técnicas de respiración probadas para encontrar la calma', descripcion: 'Expertos detallan métodos simples que se pueden aplicar en cualquier momento del día para reducir el estrés.', url_fuente: '#', url_imagen: 'https://via.placeholder.com/400x300/A7C7E7/FFFFFF?text=Mente', fuente_nombre: 'Salud Global' },
  { id: 3, categoria: 'Emoción', titulo: 'Inteligencia Emocional: ¿Por qué es más importante que el IQ?', descripcion: 'Comprender y gestionar las emociones es clave para el éxito profesional y personal.', url_fuente: '#', url_imagen: 'https://via.placeholder.com/400x300/FDFD96/FFFFFF?text=Emocion', fuente_nombre: 'Psicología Hoy' },
  // ... (aquí irían más artículos)
];

export default function Landing() {
  const [filter, setFilter] = useState('Todos'); // Estado para el filtro

  const filteredArticles = mockArticles.filter(article => 
    filter === 'Todos' || article.categoria === filter
  );

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
      {/* --- Navbar (El Header que propuso) --- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
          {/* Lado Izquierdo: Logo y Filtros */}
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
          {/* Lado Derecho: Autenticación */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/login" // O puede ir a una página /registro nueva
              className="bg-orange-500 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* --- Contenido Principal (El Feed) --- */}
      <main className="max-w-7xl mx-auto p-8 mt-4">
        <h1 className="text-4xl font-bold text-zinc-800 mb-2">Tu Rincón de Bienestar</h1>
        <p className="text-xl text-zinc-600 mb-8 font-['Patrick_Hand']">
          Artículos y noticias curadas para tu mente, cuerpo y emoción.
        </p>

        {/* Grid de Artículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </main>

      {/* --- Futuro CTA para la Encuesta Anónima --- */}
      {/* (Desactivado por ahora, pero aquí iría) */}

      {/* --- Footer --- */}
      <footer className="text-center p-10 mt-12 bg-white border-t border-zinc-100">
        <p className="text-zinc-500 text-base font-['Patrick_Hand']">
          &copy; {new Date().getFullYear()} Sun Self. Un movimiento por la calma.
        </p>
      </footer>
    </div>
  );
}
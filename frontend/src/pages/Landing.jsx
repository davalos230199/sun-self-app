// frontend/src/pages/Landing.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación interna

export default function Landing() {
  const sectionStyle = "min-h-screen flex flex-col justify-center items-center p-8 text-center relative";

  return (
    // 1. El Lienzo: Blanco. Minimalista.
    <div className="bg-white text-zinc-800 font-sans antialiased">
      
      {/* --- Header Minimalista --- */}
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
          <span className="font-['Patrick_Hand'] text-3xl font-bold text-orange-600">
            Sun Self
          </span>
          {/* Enlazamos a tu página de Filosofía existente */}
          <Link 
            to="/filosofia" 
            className="font-['Patrick_Hand'] text-xl text-zinc-700 hover:text-orange-600 transition-colors"
          >
            Filosofía
          </Link>
        </div>
      </header>

      {/* --- Sección 1: La Portada (El Primer Respiro) --- */}
      <motion.section 
        className={sectionStyle}
        style={{ paddingTop: '100px' }} // Añadimos padding para no solapar con el header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="flex flex-col items-center max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-normal text-black mb-8 font-['Patrick_Hand']">
            La ansiedad es una conversación.
            <br />
            Vamos a escucharla.
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-600 leading-relaxed font-['Patrick_Hand'] mb-12">
            Un refugio de contenido y herramientas para entender tu mente.
            <br />
            Sin presión. Sin "hacks". Solo observación.
          </p>
          <div className="absolute bottom-12 animate-bounce">
            <ArrowDown className="w-8 h-8 text-zinc-400" />
          </div>
        </div>
      </motion.section>

      {/* --- Sección 2: El Refugio (La "Wikipedia" de la Calma) --- */}
      <section className={`${sectionStyle} bg-zinc-50`}>
        <div className="max-w-5xl w-full py-16">
          <h2 className="text-4xl sm:text-5xl font-['Patrick_Hand'] text-orange-600 text-center mb-16">
            Un lugar para entender(te).
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Burbuja 1 */}
            <motion.div 
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -8 }}
            >
              <h3 className="text-2xl font-semibold mb-4 font-['Patrick_Hand'] text-zinc-800">Hábitos Reales</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Consejos prácticos y certificados. Micro-meditaciones y la ciencia del paseo consciente.
              </p>
            </motion.div>
            
            {/* Burbuja 2 */}
            <motion.div 
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -8 }}
            >
              <h3 className="text-2xl font-semibold mb-4 font-['Patrick_Hand'] text-zinc-800">Datos que Liberan</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                No estás solo. Millones sienten lo mismo. Datos de la OMS, explicados de forma humana.
              </p>
            </motion.div>
            
            {/* Burbuja 3 */}
            <motion.div 
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -8 }}
            >
              <h3 className="text-2xl font-semibold mb-4 font-['Patrick_Hand'] text-zinc-800">Manifiesto Sun Self</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                ¿Pueden coexistir el capitalismo y la calma? Lee nuestra filosofía completa.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- Sección 3: La Herramienta (El Primer Paso) --- */}
      <section className={`${sectionStyle} bg-white`}>
        <div className="flex flex-col items-center max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            Todo este conocimiento es el mapa.
          </h2>
          <h3 className="text-4xl sm:text-5xl font-normal text-orange-600 mb-10 font-['Patrick_Hand']">
            Sun Self es tu primer paso.
          </h3>
          <p className="text-xl sm:text-2xl text-zinc-600 leading-relaxed font-['Patrick_Hand'] mb-12">
            Un micro-hábito de auto-observación.
            <br />
            Sin presión. A tu ritmo.
          </p>
          
          {/* El "No-Scam" CTA. Es un LINK a la nueva página de login. */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-4 px-10 rounded-full text-2xl font-['Patrick_Hand'] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Empezar a observarme
            </Link>
          </motion.div>
          
          <p className="text-zinc-500 text-base mt-8 font-['Patrick_Hand']">
            (Es gratis y siempre lo será)
          </p>
        </div>
      </section>

      <footer className="text-center p-10 bg-zinc-50 text-zinc-500 text-base font-['Patrick_Hand']">
        <p>&copy; {new Date().getFullYear()} Sun Self. Un movimiento por la calma.</p>
      </footer>
    </div>
  );
}
// frontend/src/pages/Auth.jsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import sunLoopAnimation from '../assets/animations/sun-loop.json';

export default function Auth() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 h-screen w-full flex flex-col justify-center items-center p-8 relative">
      
      {/* Botón para volver al Manifiesto */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center text-zinc-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="font-['Patrick_Hand'] text-lg">Volver</span>
      </Link>
      
      {/* Animación de fondo sutil */}
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-25 pointer-events-none">
        <Lottie 
          animationData={sunLoopAnimation} 
          loop={true}
          style={{ width: '100%', maxWidth: '800px' }} 
        />
      </div>

      {/* Tarjeta de Login */}
      <motion.div 
        className="relative z-10 flex flex-col items-center text-center bg-white/80 backdrop-blur-md p-10 sm:p-16 rounded-3xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-['Patrick_Hand'] text-6xl font-bold text-orange-600 mb-4">
          Sun Self
        </h1>
        <p className="max-w-sm text-2xl text-zinc-700 leading-relaxed font-['Patrick_Hand'] mb-10">
          Bienvenido de vuelta.
          <br/>
          Un nuevo día para observar.
        </p>
        <button
          onClick={signInWithGoogle}
          className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-4 font-['Patrick_Hand'] px-8 rounded-full text-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center mx-auto"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="w-6 h-6 mr-3"/>
          Ingresar con Google
        </button>
      </motion.div>
    </div>
  );
}
// /frontend/src/components/WelcomeModal.jsx (Versión Simplificada y Final)

import { useState } from 'react';
import { motion } from 'framer-motion'; // Ya no se necesita AnimatePresence aquí

export default function WelcomeModal({ onAccept }) {
    const [isChecked, setIsChecked] = useState(false);

    // El componente ahora devuelve directamente el modal, sin condiciones.
    // El padre (Home.jsx) se encargará de decidir si se muestra o no.
    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} // Framer Motion usará esta animación de salida
        >
            <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden border-2 border-amber-300"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
            >
                {/* El contenido del header, body y footer se mantiene exactamente igual */}
                <div className="p-6 border-b border-zinc-200">
                    <h2 className="text-3xl font-['Patrick_Hand'] text-zinc-800 text-center">
                        Bienvenido a tu Reflejo
                    </h2>
                </div>

                <div className="p-6 text-zinc-600 text-center leading-relaxed text-base">
                    {/* ... (el texto del manifiesto resumido va aquí) ... */}
                    <p className="mb-4">Sun-Self es una herramienta simple. Un espejo, no un juez.</p>
                    <p className="mb-4">
                        Te invitamos a hacer una pausa y observarte en tres aspectos clave: 
                        tu <strong className="font-semibold text-amber-600">Mente</strong>, 
                        tu <strong className="font-semibold text-amber-600">Emoción</strong> y 
                        tu <strong className="font-semibold text-amber-600">Cuerpo</strong>.
                    </p>
                    <p>No hay respuestas correctas ni incorrectas, solo tu verdad en este preciso instante. El objetivo es uno: <strong className="font-semibold text-amber-600">poner los pies en la tierra.</strong></p>
                </div>

                <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                            className="h-5 w-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 cursor-pointer group-hover:border-amber-400 transition-colors"
                        />
                        <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors">No volver a mostrar este mensaje.</span>
                    </label>
                    <button
                        onClick={() => onAccept(isChecked)}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-8 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        Entendido
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Componente para el sol estático que gira
const SunSVG = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-12 h-12 text-amber-400 opacity-60 animate-spin-slow"
    >
        <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 0 1 0 1.061l-1.591 1.59a.75.75 0 1 1-1.061-1.06l1.59-1.591a.75.75 0 0 1 1.06 0ZM12.75 18.75a.75.75 0 0 1-1.5 0v2.25a.75.75 0 0 1 1.5 0v-2.25ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM5.657 18.343a.75.75 0 0 1 0-1.061l1.59-1.59a.75.75 0 1 1 1.061 1.06l-1.59 1.591a.75.75 0 0 1-1.061 0ZM2.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75ZM18.75 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM5.657 5.657a.75.75 0 0 1 1.061 0l1.591 1.59a.75.75 0 0 1-1.06 1.061l-1.591-1.59a.75.75 0 0 1 0-1.06ZM18.343 18.343a.75.75 0 0 1-1.061 0l-1.59-1.59a.75.75 0 0 1 1.06-1.061l1.591 1.59a.75.75 0 0 1 0 1.06Zm.002-12.247a.75.75 0 0 1 0 1.061l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.591a.75.75 0 0 1 1.06 0ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
    </svg>
);

export default function FilosofiaSunSelf() {
    return (
        // Contenedor principal para la página, replicando el estilo de Journal.jsx
        // Se centra y se adapta a la altura disponible para que el scroll sea interno.
        <main className="flex flex-col flex-grow w-full max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden bg-white h-full border border-amber-300">
            {/* Contenido de la filosofía, dentro de un contenedor con scroll */}
            <div className="flex-grow flex flex-col items-center justify-start p-6 overflow-y-auto">
                {/* Sol decorativo animado */}
                <motion.div
                    className="flex-shrink-0 mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <SunSVG />
                </motion.div>

                {/* Título de la filosofía */}
                <h1 className="font-['Patrick_Hand'] text-3xl sm:text-4xl text-zinc-800 font-bold mb-4 text-center border-b border-amber-300 pb-2">
                    Nuestra Filosofía
                </h1>

                {/* Contenido del texto */}
                <article className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed font-['Patrick_Hand'] text-lg">
                    <p>
                        Sun Self es más que una aplicación; es una invitación a la auto-observación. Creemos que la verdad más profunda reside en la simplicidad de nuestro presente. Al igual que el sol ilumina nuestro mundo exterior, Sun Self busca iluminar tu mundo interior, anclándote en el ahora a través de tres pilares fundamentales: **mente, emociones y cuerpo.**
                    </p>
                    <p>
                        A menudo, nuestra mente viaja al pasado o se proyecta al futuro, perdiendo de vista el único momento que realmente existe: este. Nuestro objetivo no es llenar tu vida de datos, sino ofrecer un espacio para que observes conscientemente el patrón de tus días, el "clima" de tu ser.
                    </p>
                    <p>
                        Cada registro diario es un paso hacia la consciencia. Cada meta lograda es un faro que marca tu progreso. Y cada reflexión es un espejo que te muestra tu propia luz.
                    </p>
                    <p>
                        Gracias por unirte a este viaje. El sol eres tú.
                    </p>
                </article>

                          <p>------------------------------------------------------------</p>
                            
                   <h4>🟡 Bienvenido a Sun-Self</h4>
          <p>Este espacio no es una red social.</p>
          <p>Tampoco es una aplicación para distraerte.</p>
          <p><strong>Sun-Self es un refugio y un espejo.</strong></p>
          <p>Un método para observarte, sin juicio, sin ruido.</p>
          <p>Al entrar, no busques resultados inmediatos.</p>
          <p>Buscá verdad. Aunque duela.</p>
  
          <h4>🌞 ¿Qué es Sun-Self?</h4>
          <p>Sun-Self es una aplicación de autoobservación emocional, mental y corporal.</p>
          <p>Una herramienta cotidiana para frenar el piloto automático y ver cómo estás, realmente.</p>
          <p>No cómo deberías estar. No cómo querés aparentar. <strong>Sino cómo estás hoy.</strong></p>
          <p>Es un viaje hacia la conciencia de uno mismo. Una bitácora simple para acompañarte día a día y reconectar con tu existencia real.</p>
          
          <h4>🌱 El método: Autoobservación para despertar conciencia</h4>
          <p>Vivimos gran parte del tiempo en modo reactivo. Pensamos sin darnos cuenta. Sentimos sin registrar. El cuerpo grita y lo silenciamos.</p>
          <p>Sun-Self propone un micro-hábito diario: Pausar. Observar tu mente, emoción y cuerpo. Anotar lo que ves. Aceptarlo.</p>
          <p>Esta práctica, constante pero simple, despierta una presencia interna. Y en esa presencia, empieza el verdadero cambio. No desde la exigencia, sino desde el reconocimiento.</p>

          <h4>⚠️ Disclaimer</h4>
          <p>Sun-Self no reemplaza ningún tratamiento profesional. No tiene base clínica, psicológica, psiquiátrica ni terapéutica oficial.</p>
          <p>Si estás atravesando una enfermedad mental diagnosticada, o sentís que no podés solo, te recomendamos fuertemente acudir a un profesional de la salud mental.</p>
          
          <h4>🔥 Origen: un grito desde el fondo</h4>
          <p>Sun-Self no nació desde la teoría. Nació desde la ansiedad insoportable, la angustia constante, la desesperación por no existir, y la depresión que no avisa.</p>
          <p>Nació desde el vacío. Desde mirar el techo sin sentido. Y un día, comencé a mirarme de verdad. A notar lo que pensaba, lo que sentía, cómo respiraba, a entender cómo me trataba.</p>
          <p>Y eso, poco a poco, me transformó.</p>
            </div>

            {/* Botón para volver a la página de Configuración */}
            <div className="flex-shrink-0 p-4 border-t border-amber-300 bg-zinc-50/70">
                <Link
                    to="/settings"
                    className="w-full flex items-center justify-center bg-zinc-700 hover:bg-zinc-800 text-white font-['Patrick_Hand'] text-lg py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                    Volver a Configuración
                </Link>
            </div>
        </main>
    );
}


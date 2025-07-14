// src/components/WelcomeModal.jsx

import { useState, useRef } from 'react';
import './WelcomeModal.css'; // Crearemos este archivo CSS en el paso 3

export default function WelcomeModal({ onAccept }) {
  // Estado para saber si el usuario ha llegado al final del texto
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  // Estado para el checkbox de "no volver a mostrar"
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  
  // Referencia al div que contiene el texto para medir su scroll
  const contentRef = useRef(null);

  // Esta función se dispara cada vez que el usuario hace scroll dentro del modal
  const handleScroll = () => {
    const contentElement = contentRef.current;
    if (contentElement) {
      // La condición es: la posición del scroll + la altura visible es >= a la altura total del contenido
      const isAtBottom = 
        contentElement.scrollHeight - contentElement.scrollTop <= contentElement.clientHeight + 1; // +1 de margen

      if (isAtBottom) {
        setIsScrolledToBottom(true);
      }
    }
  };

  const handleAcceptClick = () => {
    // Si el usuario marcó el checkbox, lo guardamos en localStorage
    if (doNotShowAgain) {
      localStorage.setItem('sunself_manifiesto_visto', 'true');
    }
    // Llamamos a la función que nos pasó el padre (Home.jsx) para cerrar el modal
    onAccept();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>Sun-Self</h2>
        </header>

        <div className="modal-body" ref={contentRef} onScroll={handleScroll}>
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

        <footer className="modal-footer">
          <div className="checkbox-container">
            <input 
              type="checkbox" 
              id="no-mostrar" 
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
            />
            <label htmlFor="no-mostrar">No volver a mostrar</label>
          </div>
          <button 
            onClick={handleAcceptClick}
            disabled={!isScrolledToBottom}
            title={isScrolledToBottom ? "Aceptar" : "Debes leer todo el contenido para continuar"}
          >
            Aceptar
          </button>
        </footer>
      </div>
    </div>
  );
}
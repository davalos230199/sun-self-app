// src/pages/Tracking.jsx

import PageHeader from '../components/PageHeader';
import FluctuationCharts from '../components/FluctuationCharts'; // Importamos el NUEVO componente
// import HistoryCalendar from '../components/HistoryCalendar'; // Futuro componente
import './Tracking.css';

export default function Tracking() {
    return (
        <div className="tracking-container">
            <PageHeader title="Tu Diario" />
            
            <div className="tracking-content">
                {/* Ya no hay pestañas. Mostramos directamente los gráficos. */}
                <div className="grafico-section">
                    <FluctuationCharts />
                </div>

                {/* Aquí es donde irá el calendario en el siguiente paso */}
                <div className="history-calendar-section" style={{marginTop: '40px'}}>
                     <h3 style={{textAlign: 'center'}}>Historial de Entradas</h3>
                     <p style={{textAlign: 'center'}}>Próximamente: un calendario interactivo para explorar tus recuerdos.</p>
                     {/* <HistoryCalendar /> */}
                </div>
            </div>
        </div>
    );
}
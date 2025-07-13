import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import EstadoChart from '../components/EstadoChart';
import ListaRecuerdos from '../components/ListaRecuerdos';
import { LineChart, BookOpen } from 'lucide-react'; // Importamos los iconos
import './Tracking.css';

export default function Tracking() {
    // Estado para saber qué vista mostrar: 'grafico' o 'recuerdos'. Por defecto, el gráfico.
    const [activeTab, setActiveTab] = useState('grafico'); 
    
    // Estado para el filtro de tiempo del gráfico: 'semanal', 'mensual', o 'todos'.
    const [filter, setFilter] = useState('mensual'); 

    return (
        <div className="tracking-container">
            <PageHeader title="Tu Diario" />
            
            {/* Pestañas para cambiar entre vistas */}
            <div className="tracking-tabs">
                <button 
                    className={`tab-button ${activeTab === 'grafico' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grafico')}
                    aria-label="Ver Fluctuación"
                >
                    <LineChart size={20} />
                    <span>Fluctuación</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'recuerdos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recuerdos')}
                    aria-label="Ver Recuerdos"
                >
                    <BookOpen size={20} />
                    <span>Recuerdos</span>
                </button>
            </div>

            {/* Contenido que cambia según la pestaña activa */}
            <div className="tracking-content">
                {activeTab === 'grafico' && (
                    <div className="grafico-section">
                        {/* Botones para filtrar el período del gráfico */}
                        <div className="filter-buttons">
                            <button className={filter === 'semanal' ? 'active' : ''} onClick={() => setFilter('semanal')}>Semanal</button>
                            <button className={filter === 'mensual' ? 'active' : ''} onClick={() => setFilter('mensual')}>Mensual</button>
                            <button className={filter === 'todos' ? 'active' : ''} onClick={() => setFilter('todos')}>Todo</button>
                        </div>
                        {/* El componente del gráfico, que recibe el filtro */}
                        <EstadoChart filter={filter} />
                    </div>
                )}

                {activeTab === 'recuerdos' && (
                    // El componente que muestra la lista de registros pasados
                    <ListaRecuerdos />
                )}
            </div>
        </div>
    );
}

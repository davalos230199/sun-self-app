// src/components/FluctuationCharts.jsx

import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookText } from 'lucide-react';
import './FluctuationCharts.css'; // Asegúrate de que este archivo CSS se actualice

// --- ¡ACTUALIZADO! ---
// La nueva escala de valores y la configuración asociada.
const statusToValue = (status) => {
    switch (status) {
        case 'alto':
        case 'soleado':
            return 3;
        case 'neutral':
        case 'nublado':
            return 2;
        case 'bajo':
        case 'lluvioso':
            return 1;
        default:
            return 0; // Un valor base por si algo falla
    }
};

const VISTAS_CONFIG = {
    general: { dataKey: 'general_valor', nombre: 'General', color: '#8884d8' },
    mente: { dataKey: 'mente_valor', nombre: 'Mente', color: '#82ca9d' },
    emocion: { dataKey: 'emocion_valor', nombre: 'Emoción', color: '#ffc658' },
    cuerpo: { dataKey: 'cuerpo_valor', nombre: 'Cuerpo', color: '#ff8042' }
};

// --- ¡MODIFICADO! Solo emojis para el eje Y ---
// --- ¡CORRECCIÓN! Aseguramos que esta función se use correctamente ---
const yAxisTickFormatter = (value) => {
    switch (value) {
        case 3: return '☀️';
        case 2: return '⛅';
        case 1: return '🌧️';
        default: return '';
    }
};

const getEmojiForValue = (value) => {
    switch (value) {
        case 3: return '☀️';
        case 2: return '⛅';
        case 1: return '🌧️';
        default: return '❔';
    }
};

export default function FluctuationCharts() {
    const [fullData, setFullData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vistaSeleccionada, setVistaSeleccionada] = useState('general');
    const [filtroTiempo, setFiltroTiempo] = useState('todo');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.getRegistros();
                
                // Usamos la nueva función statusToValue para procesar los datos
                const processedData = response.data.map(registro => ({
                    id: registro.id, // ¡NUEVO! Necesitamos el ID para navegar
                    fecha: new Date(registro.created_at), // Guardamos el objeto Date completo para poder filtrar
                    fechaStr: new Date(registro.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                    general_valor: statusToValue(registro.estado_general),
                    mente_valor: statusToValue(registro.mente_estat),
                    emocion_valor: statusToValue(registro.emocion_estat),
                    cuerpo_valor: statusToValue(registro.cuerpo_estat),
                    mente_coment: registro.mente_coment,
                    emocion_coment: registro.emocion_coment,
                    cuerpo_coment: registro.cuerpo_coment,
                    frase_del_dia: registro.frase_del_dia || "Tu estado general de este día.",
                    tiene_hoja_atras: !!registro.hoja_atras
                })).sort((a, b) => a.fecha - b.fecha); // Ordenamos de más antiguo a más nuevo

                setFullData(processedData);
                setError(null);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError("No se pudieron cargar tus datos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    

    // --- ¡CORRECCIÓN! Lógica de filtrado mejorada para la vista semanal ---
    const datosFiltrados = useMemo(() => {
        const ahora = new Date();
        
        if (filtroTiempo === 'semanal') {
            const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            let semanaScaffold = [];
            
            // 1. Encontrar el lunes de esta semana
            const primerDiaSemana = new Date(ahora);
            const diaDeSemana = ahora.getDay();
            const diferencia = diaDeSemana === 0 ? 6 : diaDeSemana - 1;
            primerDiaSemana.setDate(ahora.getDate() - diferencia);
            
            // 2. Crear un esqueleto para los 7 días de la semana
            for (let i = 0; i < 7; i++) {
                const fechaDia = new Date(primerDiaSemana);
                fechaDia.setDate(primerDiaSemana.getDate() + i);
                semanaScaffold.push({
                    fecha: fechaDia,
                    fechaStr: diasSemana[i], // Usamos el nombre corto del día para el eje X
                    general_valor: null, mente_valor: null, emocion_valor: null, cuerpo_valor: null // Valores por defecto
                });
            }

            // 3. Rellenar el esqueleto con los datos reales
            fullData.forEach(datoReal => {
                const dia = datoReal.fecha.getDay();
                const indice = dia === 0 ? 6 : dia - 1; // Mapear a nuestro array que empieza en Lunes
                if (semanaScaffold[indice] && semanaScaffold[indice].fecha.toDateString() === datoReal.fecha.toDateString()) {
                    semanaScaffold[indice] = { ...semanaScaffold[indice], ...datoReal, fechaStr: diasSemana[indice] };
                }
            });

            return semanaScaffold;
        }

        if (filtroTiempo === 'mensual') {
            return fullData.filter(d => 
                d.fecha.getMonth() === ahora.getMonth() &&
                d.fecha.getFullYear() === ahora.getFullYear()
            );
        }
        
        return fullData; // Filtro "todo"
    }, [fullData, filtroTiempo]);

    
    const configActual = VISTAS_CONFIG[vistaSeleccionada];


 // --- ¡MODIFICADO! Ahora usa los datos filtrados ---
    const MemoriasCards = () => {
        const dataRelevante = [...datosFiltrados].filter(d => {
            if (vistaSeleccionada === 'general') return !!d.frase_del_dia;
            return !!d[`${vistaSeleccionada}_coment`];
        }).reverse();

        if (dataRelevante.length === 0) {
            return <p className="memoria-placeholder">No hay memorias escritas para este período.</p>
        }

        return dataRelevante.map((dato) => (
            <div key={dato.id} className="memoria-card">
                <div className="memoria-header">
                    <span className="memoria-fecha">{dato.fechaStr}</span>
                    <span className="memoria-emoji" title={yAxisTickFormatter(dato[configActual.dataKey])}>
                        {getEmojiForValue(dato[configActual.dataKey])}
                    </span>
                </div>
                <div className="memoria-body">
                    <p>"{vistaSeleccionada === 'general' ? dato.frase_del_dia : dato[`${vistaSeleccionada}_coment`]}"</p>
                </div>
                {/* --- ¡MODIFICADO! El footer ahora es un botón --- */}
                {dato.tiene_hoja_atras && (
                     <button className="memoria-footer" onClick={() => navigate(`/journal/${dato.id}`)}>
                        <BookText size={16} />
                        <span>Ver más notas</span>
                     </button>
                )}
            </div>
        ));
    };

    if (loading) return <p className="chart-message">Dibujando tus fluctuaciones...</p>;
    if (error) return <p className="chart-message error">{error}</p>;

    return (
        <div className="analysis-container">
            {/* Contenedor para los selectores */}
            <div className="selectors-wrapper">
            <div className="vista-selector">
                {Object.keys(VISTAS_CONFIG).map((key) => (
                    <button
                        key={key}
                        className={`selector-btn ${vistaSeleccionada === key ? 'active' : ''}`}
                        onClick={() => setVistaSeleccionada(key)}
                        style={{'--btn-color': VISTAS_CONFIG[key].color}}
                    >
                        {VISTAS_CONFIG[key].nombre}
                    </button>
                ))}
            </div>

      {/* --- ¡NUEVO! Selector de tiempo --- */}
                <div className="tiempo-selector">
                    <button className={`tiempo-btn ${filtroTiempo === 'semanal' ? 'active' : ''}`} onClick={() => setFiltroTiempo('semanal')}>Semanal</button>
                    <button className={`tiempo-btn ${filtroTiempo === 'mensual' ? 'active' : ''}`} onClick={() => setFiltroTiempo('mensual')}>Mensual</button>
                    <button className={`tiempo-btn ${filtroTiempo === 'todo' ? 'active' : ''}`} onClick={() => setFiltroTiempo('todo')}>Todo</button>
                </div>
            </div>

            {fullData.length === 0 ? (
                 <p className="chart-message">Aún no tienes registros en tu diario. ¡Crea el primero!</p>
            ) : (
                <>
                    {/* --- ¡MODIFICADO! Contenedor del gráfico para estabilidad --- */}
                    <div className="chart-wrapper">
                        {datosFiltrados.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={datosFiltrados} margin={{ top: 20, right: 10, left: -35, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="fechaStr" tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 3.5]}
                                        ticks={[1, 2, 3]}
                                        tickFormatter={yAxisTickFormatter} // Conectado aquí
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip cursor={{fill: 'rgba(206, 206, 206, 0.2)'}} />
                                    <Bar 
                                        dataKey={configActual.dataKey} 
                                        name={configActual.nombre} 
                                        radius={[4, 4, 0, 0]}
                                        fill={configActual.color} // El color se aplica directamente aquí
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="chart-message">No hay datos para el período seleccionado.</p>
                        )}
                    </div>

                    <div className="memorias-container">
                        <h4 className="memorias-titulo">Tus Memorias de {configActual.nombre}</h4>
                        <div className="memorias-grid">
                            <MemoriasCards />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

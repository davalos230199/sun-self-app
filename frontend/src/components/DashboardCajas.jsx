// frontend/src/components/DashboardCajas.jsx (El Sandbox del Arquitecto - Completo)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDia } from '../contexts/DiaContext';
import { LayoutDashboard, BarChart3 } from 'lucide-react';

// --- Los Ladrillos Nuevos ---
import DashboardVacio from './DashboardVacio';
import SlideDeRegistro from './SlideDeRegistro';
import ChecklistDeMetas from './ChecklistDeMetas';

// --- (Copiamos el 'CajaLink' del archivo viejo para los botones de abajo) ---
const CajaLink = ({ to, children }) => (
    <Link 
        to={to}
        className="aspect-square bg-white border border-zinc-200 rounded-2xl shadow-lg 
                   flex flex-col items-center justify-center p-4 
                   text-zinc-700 hover:bg-zinc-50 transition-colors no-underline"
    >
        {children}
    </Link>
);
// ---

// --- El Componente Principal (Reconstruido) ---
export default function DashboardCajas({ onEdit }) {
    const { registroDeHoy } = useDia(); 
    
    // Estado del acordeón para el SlideDeRegistro
    const [isSlideExpanded, setIsSlideExpanded] = useState(false);

    // Si no hay registro, mostramos la invitación
    if (!registroDeHoy) {
        return <DashboardVacio onStartRitual={onEdit} />;
    }

    // Si hay registro, mostramos el NUEVO dashboard
    // Eliminamos el 'p-4' del contenedor principal
    return (
        <div className="h-full flex flex-col space-y-4">
            
                        {/* 2. Ladrillo: El Checklist de Metas */}
            <div className="flex-shrink-0">
                <ChecklistDeMetas />
            </div>

            {/* 1. Ladrillo: El Slide de Estado */}
            <div className="flex-shrink-0">
                <SlideDeRegistro 
                    registro={registroDeHoy}
                    variant="dashboard" // <-- La nueva variante
                    onEdit={onEdit}      // <-- Pasamos la función de editar
                    isExpanded={isSlideExpanded}
                    onToggle={() => setIsSlideExpanded(!isSlideExpanded)}
                />
            </div>

            {/* 3. Ladrillos: Los Botones de Navegación */}
            {/* (Le damos 'pt-4' a la grilla para que no esté pegada) */}
            <div className="flex-grow grid grid-cols-2 gap-4 pt-4">
                <CajaLink to={`/app/journal`}>
                    <LayoutDashboard size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Tablero</span>
                </CajaLink>
                
                <CajaLink to="/app/tracking">
                    <BarChart3 size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Tracking</span>
                </CajaLink>
            </div>
            
        </div>
    );
}


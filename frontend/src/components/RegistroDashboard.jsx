import React, { useState, useEffect }  from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useDia } from '../contexts/DiaContext';
import api from '../services/api';
import { Star, Settings } from 'lucide-react';

// --- Animaciones ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';


// --- SUB-COMPONENTES REFACTORIZADOS ---

const MetaPrincipalWidget = ({ meta, metasDelDia }) => {
    // Lógica para el contador de metas, tal como lo pediste
    const completadas = metasDelDia?.filter(m => m.completada).length || 0;
    const total = metasDelDia?.length || 0;

    if (!meta) {
        return (
            <div className="bg-green-50 border border-amber-400 rounded-2xl p-5 text-center justify-center">
                <h3 className="font-['Patrick_Hand'] text-xl text-amber-800">No definiste un norte para hoy.</h3>
                <p className="text-zinc-500 text-sm mt-1">Puedes añadir metas secundarias desde la sección Metas.</p>
            </div>
        );
    }

    return (
        <Link to="/metas" className="no-underline text-inherit block">
            <div className="bg-green-100 border-2 border-amber-400 rounded-2xl p-5 text-center shadow-lg space-y-2">
                <div className="flex justify-center items-center gap-2">
                    <Star className="text-amber-500" size={20} />
                    <h2 className="font-['Patrick_Hand'] text-lg text-amber-800">Tu Norte para Hoy</h2>
                </div>
                <h3 className="text-2xl uppercase text-green-900 break-words">{meta.descripcion}</h3>
                {total > 0 && (
                    <div className="text-xs font-semibold text-zinc-500 bg-white/50 rounded-full px-2 py-1 inline-block">
                        {completadas} de {total} metas completadas
                    </div>
                )}
            </div>
        </Link>
    );
};

const MiniHistorial = ({ historial }) => (
    <div className="absolute top-3 left-3 w-20 h-20 rounded-lg overflow-hidden bg-black/5">
        <p className="text-xs font-semibold italic lowercase text-zinc-500 mt-1">Últimos 7 días</p>
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide -m-4 ml-1">
            {historial.map(reg => {
                const anim = reg.estado_general === 'soleado' ? sunLoopAnimation : reg.estado_general === 'lluvioso' ? rainLoopAnimation : cloudLoopAnimation;
                const fecha = new Date(reg.created_at);
                let diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
                diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1).replace('.', '');

                return (
                    // 3. Cada diapositiva tiene el MISMO ancho que el contenedor.
                    <div key={reg.id} className="w-20 flex-shrink-0 snap-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12"><Lottie animationData={anim} loop={true} /></div>
                        <p className="text-xs font-semibold text-zinc-500 -mt-2">{diaSemana}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const EstadoWidget = ({ registro, onEdit, historial }) => {

    const navigate = useNavigate();
        // Pequeño componente para mostrar cada comentario
    const ComentarioItem = ({ anim, text }) => (
        <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 flex-shrink-0 -ml-1">
                <Lottie animationData={anim} loop={true} />
            </div>
            <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text}"</p>
        </div>
    );

    return (
        <Link to="/tracking" className="no-underline text-inherit block">
        <div className="relative flex flex-col border border-amber-400 bg-amber-100 rounded-2xl p-4 text-center shadow-lg h-full justify-between">
            {/* El historial vive aquí, en su esquina */}
            <MiniHistorial historial={historial} />         
                <h3 className="font-['Patrick_Hand'] text-xl text-amber-800">Tu estado de hoy</h3>
                <div className="w-24 h-24 mx-auto -my-2"><Lottie animationData={registro.estado_general === 'soleado' ? sunLoopAnimation : registro.estado_general === 'lluvioso' ? rainLoopAnimation : cloudLoopAnimation} loop={true} /></div>
                <p className="flex-grow text-zinc-700 font-['Patrick_Hand']">"{registro.frase_sunny || '...'}"</p>
                <div className="space-y-2 border-t border-dashed border-amber-300 pt-3 text-left">
                <ComentarioItem anim={brainLoopAnimation} text={registro.mente_comentario} />
                <ComentarioItem anim={emotionLoopAnimation} text={registro.emocion_comentario} />
                <ComentarioItem anim={bodyLoopAnimation} text={registro.cuerpo_comentario} />
                </div>
                <footer className="mt-auto pt-3 border-t border-dashed border-amber-200 text-xs text-zinc-500 font-semibold">
                    Toca para ver tu historial completo...
                </footer>
        </div>
        </Link>
    );
};

// --- NUEVOS WIDGETS PARA EL DASHBOARD ---

const DiarioWidget = ({ registroId }) => (
    <Link to={`/journal/${registroId}`} className="no-underline text-inherit block h-full group">
        {/* Usamos un color azul pizarra, elegante y sobrio */}
        <div className="h-full bg-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-slate-600 transition-colors">
            <h3 className="font-['Patrick_Hand'] text-lg text-white">Tu Diario</h3>
            <p className="text-xs text-slate-300">Un espacio para tus pensamientos.</p>
        </div>
    </Link>
);

const PersonalizacionWidget = () => (
    <div className="h-full bg-zinc-100 border border-dashed border-zinc-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
        <Settings className="text-zinc-400 mb-2" size={40} />
        <h3 className="font-['Patrick_Hand'] text-lg text-zinc-700">Personaliza tu Ritual</h3>
        <p className="text-sm text-zinc-500">(Próximamente)</p>
    </div>
);


// --- COMPONENTE PRINCIPAL REFACTORIZADO ---
export default function RegistroDashboard({ onEdit }) {
    const { registroDeHoy, metas } = useDia();
    const [historialSemanal, setHistorialSemanal] = useState([]);
        useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const response = await api.getResumenSemanal();
                // Filtramos el registro de hoy para no mostrarlo duplicado
                const ayerYAntes = response.data.filter(reg => 
                    new Date(reg.created_at).toDateString() !== new Date().toDateString()
                );
                setHistorialSemanal(ayerYAntes);
            } catch (error) {
                console.error("Error al cargar el resumen semanal:", error);
            }
        };
        fetchHistorial();
    }, []);

    if (!registroDeHoy) return null;
    
    const metaPrincipal = registroDeHoy.meta_principal_id
        ? metas.find(meta => meta.id === registroDeHoy.meta_principal_id)
        : null;

    return (
        // Nuevo orden de filas: Meta, Estado, y al final los widgets del Diario/Personalización
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4 animate-fade-in">
            {/* Fila 1 (Meta) */}
            <div><MetaPrincipalWidget meta={metaPrincipal} metasDelDia={metas} /></div>

            {/* Fila 2 (Estado, ahora se expande y contiene el historial) */}
            <div><EstadoWidget registro={registroDeHoy} onEdit={onEdit} historial={historialSemanal} /></div>

            {/* Fila 3 (Diario y Personalización) */}
            <div className="grid grid-cols-2 gap-4 h-32"> {/* Damos una altura fija a la fila inferior */}
                <div className="col-span-1"><DiarioWidget registroId={registroDeHoy.id} /></div>
                <div className="col-span-1"><PersonalizacionWidget /></div>
            </div>
        </div>
    );
}
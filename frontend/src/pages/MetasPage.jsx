import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, PersonStanding, PlayCircle, Mic, ChevronDown, ChevronRight, ExternalLink, Zap, ArrowLeft } from 'lucide-react';
// --- DATOS (Sin cambios) ---
const moduleConfig = {
    mente: {
        title: "Mente",
        subtitle: "Claridad & Enfoque",
        description: "Herramientas para reducir el ruido mental.",
        theme: "blue",
        icon: Brain,
        faqs: [
            { Q: "¿Qué es la 'Desfusión'?", A: "Ver un pensamiento solo como palabras, no como una verdad absoluta." },
            { Q: "¿Por qué no paro de pensar?", A: "Tu cerebro busca problemas. El registro le da una tarea concreta para calmarse." },
        ],
        podcasts: [
            { id: 1, title: "Entiende tu Cerebro", creator: "Neuro Pop", cover: "bg-blue-200", link: "#" },
            { id: 2, title: "Mindfulness Real", creator: "Ana Paz", cover: "bg-blue-300", link: "#" },
        ],
        videos: [
            { id: 1, title: "Cómo dejar de pensar", creator: "BetterIdeas", thumbnail: "bg-zinc-200", link: "#" },
        ]
    },
    emocion: {
        title: "Emoción",
        subtitle: "Regulación Afectiva",
        description: "Aprende a etiquetar lo que sientes para calmar la amígdala.",
        theme: "pink",
        icon: Heart,
        faqs: [
            { Q: "¿Por qué nombrar lo que siento?", A: "Activa tu corteza prefrontal y frena la reacción emocional pura." },
        ],
        podcasts: [
            { id: 1, title: "Inteligencia Emocional", creator: "FeelGood", cover: "bg-pink-200", link: "#" },
        ],
        videos: [
            { id: 1, title: "Ciencia de la calma", creator: "Huberman Lab", thumbnail: "bg-zinc-200", link: "#" },
        ]
    },
    cuerpo: {
        title: "Cuerpo",
        subtitle: "Energía & Sueño",
        description: "Lee las señales físicas antes de agotarte.",
        theme: "green",
        icon: PersonStanding,
        faqs: [
            { Q: "¿Carga alostática?", A: "El costo acumulado del estrés en tu cuerpo." },
        ],
        podcasts: [
            { id: 1, title: "Dormir Mejor", creator: "Sleep Coach", cover: "bg-green-200", link: "#" },
        ],
        videos: [
            { id: 1, title: "Liberar tensión", creator: "Yoga Adriene", thumbnail: "bg-zinc-200", link: "#" },
        ]
    }
};

// --- COMPONENTES UI ---
const ResourceCard = ({ type, data }) => {
    const Icon = type === 'podcast' ? Mic : PlayCircle;
    return (
        <a href={data.link} className="flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-xl shadow-sm mb-3 active:scale-95 transition-transform">
            <div className={`w-12 h-12 ${data.cover || data.thumbnail} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={20} className="text-zinc-600 opacity-50" />
            </div>
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-zinc-800 text-sm truncate">{data.title}</h5>
                <p className="text-xs text-zinc-500 truncate">{data.creator}</p>
            </div>
            <ExternalLink size={14} className="text-zinc-300" />
        </a>
    );
};

const SimpleAccordion = ({ question, answer, color }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-zinc-50 last:border-none">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left py-3 flex justify-between items-center text-sm font-bold text-zinc-700">
                {question}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-${color}-500`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden text-xs text-zinc-500 pb-3 leading-relaxed">
                        {answer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FabricaPage() {
    const [selectedModule, setSelectedModule] = useState(null); 
    const activeData = selectedModule ? moduleConfig[selectedModule] : null;

    // --- VISTA DETALLE ---
    if (selectedModule && activeData) {
        const themeColors = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
        }[activeData.theme];

        return (
            // SIN APPLAYOUT AQUÍ
            <div className="flex flex-col h-full animate-fade-in"> {/* Un div contenedor simple */}
                
                {/* Header de Navegación Interna */}
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => setSelectedModule(null)} 
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-600 active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className={`text-2xl font-['Patrick_Hand'] font-bold ${themeColors.text}`}>
                        {activeData.title}
                    </h2>
                </div>

                <div className="space-y-6 pb-24"> {/* pb-24 para dar espacio al Navbar real del padre */}
                    {/* Intro */}
                    <div className={`p-5 rounded-3xl ${themeColors.bg} border ${themeColors.border}`}>
                        <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                            {activeData.description}
                        </p>
                    </div>

                    {/* FAQs */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Conceptos Clave</h3>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                            {activeData.faqs.map((f, i) => (
                                <SimpleAccordion key={i} question={f.Q} answer={f.A} color={activeData.theme} />
                            ))}
                        </div>
                    </div>

                    {/* Recursos */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Para Escuchar</h3>
                        {activeData.podcasts.map(p => <ResourceCard key={p.id} type="podcast" data={p} />)}
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Para Ver</h3>
                        {activeData.videos.map(v => <ResourceCard key={v.id} type="video" data={v} />)}
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA LOBBY ---
    return (
        // SIN APPLAYOUT AQUÍ TAMPOCO
        <div className="animate-fade-in pb-20"> 

            <div className="grid gap-4 mt-4">
                {['mente', 'emocion', 'cuerpo'].map((key) => {
                    const item = moduleConfig[key];
                    const Icon = item.icon;
                    const style = {
                        mente: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                        emocion: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
                        cuerpo: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
                    }[key];

                    return (
                        <motion.button
                            key={key}
                            onClick={() => setSelectedModule(key)}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-5 rounded-[2rem] border ${style.border} ${style.bg} flex items-center justify-between group shadow-sm`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <Icon size={24} className={style.text} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`text-xl font-bold font-['Patrick_Hand'] ${style.text}`}>{item.title}</h3>
                                    <p className="text-xs text-zinc-500 font-medium">{item.subtitle}</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                                <ChevronRight size={20} className={style.text} />
                            </div>
                        </motion.button>
                    );
                })}

                <div className="mt-4 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 text-center">
                    <Zap size={24} className="text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">
                        Pronto agregaremos más módulos<br/> para tu taller.
                    </p>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TimePicker from 'react-time-picker';
// Importamos los estilos que ya tenías
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import '../../styles/timepicker-override.css';

import api from '../../services/api';
import { useDia } from '../../contexts/DiaContext';

export default function FormularioNuevaMeta() {
    const { setMetas } = useDia(); // Lo necesita para el 'optimistic update'
    const [descripcion, setDescripcion] = useState('');
    const [hora, setHora] = useState('');

    const prefillTime = () => {
        if (!hora) { 
            const ahora = new Date();
            ahora.setMinutes(ahora.getMinutes() + 15);
            const horaSugerida = ahora.toTimeString().substring(0, 5);
            setHora(horaSugerida);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion.trim()) return;

        const nuevaMetaTemp = { id: `temp-${Date.now()}`, descripcion, hora_objetivo: hora || null, completada: null };
        setMetas(prev => [...prev, nuevaMetaTemp]);
        
        const descripcionTemp = descripcion;
        const horaTemp = hora || null;
        setDescripcion('');
        setHora('');

        try {
            const { data: metaGuardada } = await api.createMeta({ descripcion: descripcionTemp, hora_objetivo: horaTemp });
            setMetas(prev => prev.map(m => m.id === nuevaMetaTemp.id ? metaGuardada : m));
        } catch (error) {
            console.error("Error creando meta, revirtiendo:", error);
            setMetas(prev => prev.filter(m => m.id !== nuevaMetaTemp.id));
        }
    };

    return (
        <motion.form 
            layout
            onSubmit={handleSubmit} 
            className="p-2 bg-green-50 rounded-xl flex items-center gap-4"
        >
            <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onFocus={prefillTime}
                placeholder="En 15 arranco.."
                className="flex-grow italic w-full font-['Patrick_Hand'] text-lg p-2 bg-transparent border-none focus:ring-0 outline-none"
            />
            <div className="flex-shrink-0">
                <TimePicker
                    onChange={setHora}
                    value={hora}
                    className="w-24 bg-zinc-50 font-['Patrick_Hand'] rounded-lg text-lg"
                    disableClock={true}
                    clearIcon={null}
                    format="HH:mm"
                />
            </div>
            <button 
                type="submit" 
                className="flex-shrink-0 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={!descripcion.trim()}
            >
                <Plus size={24} />
            </button>
        </motion.form>
    );
}
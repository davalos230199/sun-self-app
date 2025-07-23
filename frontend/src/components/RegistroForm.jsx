import React, { useState } from 'react';
import api from '../services/api';

// Componente interno para cada orbe.
const PostItOrbe = ({ orbe, estados, onSeleccion, onComentario, onInspiracion }) => {
    const [pidiendoInspiracion, setPidiendoInspiracion] = useState(false);
    const opciones = [ { valor: 'bajo', emoji: '🌧️' }, { valor: 'neutral', emoji: '⛅' }, { valor: 'alto', emoji: '☀️' } ];

    const handleInspiracionClick = async () => {
        setPidiendoInspiracion(true);
        await onInspiracion(orbe);
        setPidiendoInspiracion(false);
    };

    return (
        <div className="post-it-orbe">
            <div className="post-it-header">
                <h3>{orbe}</h3>
                <div className="orbe-buttons">
                    {opciones.map(({ valor, emoji }) => (
                        <button key={valor} className={`icon-button ${estados[orbe].seleccion === valor ? 'selected' : ''}`} onClick={() => onSeleccion(orbe, valor)} type="button" title={valor}>{emoji}</button>
                    ))}
                </div>
            </div>
            <textarea
                placeholder={pidiendoInspiracion ? "Buscando inspiración..." : `¿Algún pensamiento sobre tu ${orbe}?`}
                value={estados[orbe].comentario}
                onChange={(e) => onComentario(orbe, e.target.value)}
                rows="2"
            />
            <div className="post-it-actions">
                <button onClick={handleInspiracionClick} className="inspiracion-btn" type="button" disabled={pidiendoInspiracion}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <span>Ver Ejemplo</span>
                </button>
            </div>
        </div>
    );
};

export default function RegistroForm({ onSaveSuccess }) {
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    const [metaDelDia, setMetaDelDia] = useState('');
    const [compartirAnonimo, setCompartirAnonimo] = useState(false);
    // --- CORRECCIÓN AQUÍ ---
    // Se reintroduce el estado que faltaba para manejar la lógica de inspiración.
    const [inspiracionSolicitada, setInspiracionSolicitada] = useState({ mente: false, emocion: false, cuerpo: false });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSeleccion = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } })); };
    const handleComentario = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } })); };

    const handleInspiracion = async (orbe) => {
        try {
            const response = await api.getInspiracion(orbe);
            const textoInspiracion = response.data.inspiracion;
            setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: textoInspiracion } }));
            // Ahora 'setInspiracionSolicitada' está definido y funciona.
            setInspiracionSolicitada(prev => ({ ...prev, [orbe]: true }));
        } catch (err) {
            console.error("Error al obtener inspiración:", err);
            setError("No se pudo obtener la inspiración. Inténtalo de nuevo.");
        }
    };

    const handleGuardar = async () => {
        setError('');
        if (!estados.mente.seleccion || !estados.emocion.seleccion || !estados.cuerpo.seleccion) {
            setError("Por favor, selecciona un estado para cada orbe.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = { ...estados, meta_del_dia: metaDelDia, compartir_anonimo: compartirAnonimo };
            
            await api.saveRegistro(payload);
            
            onSaveSuccess();

        } catch (error) {
            console.error("Error al guardar:", error);
            setError("No se pudo guardar el registro. Por favor, inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="formulario-estado">
            {error && <p className="error-mensaje">{error}</p>}
            <p className="form-subtitle">¿Cómo estás hoy?</p>
            <div className="orbes-container">
                {['mente', 'emocion', 'cuerpo'].map((orbe) => (
                    <PostItOrbe key={orbe} orbe={orbe} estados={estados} onSeleccion={handleSeleccion} onComentario={handleComentario} onInspiracion={handleInspiracion} />
                ))}
                <div className="post-it-orbe">
                    <div className="post-it-header">
                        <h3>Meta del Día (opcional)</h3>
                        <span className="meta-icon">🎯</span>
                    </div>
                    <textarea placeholder="¿Cuál es tu pequeño gran objetivo para hoy?" value={metaDelDia} onChange={(e) => setMetaDelDia(e.target.value)} rows="2" />
                </div>
            </div>
            <div className="consentimiento-container">
                <input type="checkbox" id="compartir" checked={compartirAnonimo} onChange={(e) => setCompartirAnonimo(e.target.checked)} />
                <label htmlFor="compartir">
                    <span className="emoji-label">💌</span> Compartir mis comentarios (anónimamente) para inspirar a otros.
                </label>
            </div>
            <footer className="form-actions">
                <button onClick={handleGuardar} className="primary" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
            </footer>
        </div>
    );
}

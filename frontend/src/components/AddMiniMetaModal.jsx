import React, { useState } from 'react';
import api from '../services/api';
import './AddMiniMetaModal.css';

// El componente ahora acepta 'userId' como una prop, que es crucial para la llamada a la API.
export default function AddMiniMetaModal({ registroId, userId, onClose, onSaveSuccess }) {
    const [descripcion, setDescripcion] = useState('');
    const [horaObjetivo, setHoraObjetivo] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        // Validación simple para asegurar que los campos no estén vacíos.
        if (!descripcion || !horaObjetivo) {
            setError('Por favor, completa la descripción y la hora.');
            return;
        }
        setError('');
        setIsSaving(true);

        try {
            // Pasamos los 4 parámetros a la función de la API, incluyendo el userId.
            await api.createMiniMeta(descripcion, horaObjetivo, registroId, userId);
            
            // Si la creación es exitosa, llamamos a las funciones de callback.
            onSaveSuccess(); // Para refrescar la lista de metas en la página anterior.
            onClose(); // Para cerrar el modal.

        } catch (err) {
            console.error("Error al guardar la mini-meta:", err);
            setError("No se pudo guardar la meta. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    // Envolvemos el guardado en una función 'handleSubmit' para que el formulario la pueda usar.
    const handleSubmit = (event) => {
        event.preventDefault(); // Previene que la página se recargue al enviar el formulario.
        handleSave();
    };

    return (
        // El overlay oscuro que cubre la pantalla. Al hacer clic, se cierra el modal.
        <div className="modal-overlay" onClick={onClose}>
            {/* El contenido del modal. Hacemos stopPropagation para que un clic aquí no cierre el modal. */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Usamos una etiqueta <form> para que la tecla "Enter" active el envío. */}
                <form onSubmit={handleSubmit}>
                    <h2>Añadir Nueva Meta ☁️</h2>
                    <p>Define un pequeño paso para construir un gran día.</p>
                    
                    {error && <p className="error-mensaje">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Ej: Salir a caminar 15 minutos"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="hora_objetivo">¿A qué hora?</label>
                        <input
                            type="time"
                            id="hora_objetivo"
                            value={horaObjetivo}
                            onChange={(e) => setHoraObjetivo(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="secondary" disabled={isSaving}>
                            Cancelar
                        </button>
                        {/* El botón principal ahora es de tipo "submit" para que funcione con "Enter". */}
                        <button type="submit" className="primary" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

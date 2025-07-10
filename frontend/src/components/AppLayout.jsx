// frontend/src/components/AppLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './AppLayout.css';

// 1. El componente ahora acepta 'user' como una prop.
export default function AppLayout({ user }) {
  return (
    <div className="app-container">
      {/* Le pasamos el usuario a la Navbar por si lo necesita en el futuro */}
      <Navbar user={user} />
      <main className="content-area">
        {/* 2. ¡AQUÍ ESTÁ EL ARREGLO! Pasamos el 'user' al contexto del Outlet. */}
        <Outlet context={{ user }} />
      </main>
      <aside className="right-sidebar">
        <div className="placeholder-card">
          <h3>El Método Sun-Self</h3>
          <p>Este espacio está reservado para explorar la teoría y la filosofía detrás del método. Un futuro ebook para tu viaje de autoconocimiento.</p>
        </div>
      </aside>
    </div>
  );
}

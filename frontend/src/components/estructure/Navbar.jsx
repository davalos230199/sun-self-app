// src/components/Navbar.jsx

import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarCheck, Sun, Users, Settings } from 'lucide-react';
import { useDia } from '../../contexts/DiaContext';

export default function Navbar() {
  const location = useLocation();
  const { theme } = useDia();
  const homeRelatedPaths = ['/home', '/tracking'];
  const isHomeActive = homeRelatedPaths.includes(location.pathname) || 
                       location.pathname.startsWith('/journal') || 
                       location.pathname.startsWith('/resumen');

  const baseStyle = "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200";

  return (
    <nav className="flex-shrink-0 w-full h-20 bg-amber-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] border-t border-zinc-200 flex justify-around items-stretch px-2">
      
      <NavLink 
        to="/home" 
        className={`${baseStyle} ${isHomeActive ? theme.activeIcon : 'text-zinc-400 hover:text-zinc-700'}`}
      >
        <Home size={28} />
        <span className="text-xs font-semibold">Home</span>
      </NavLink>

      <NavLink to="/metas" className={({isActive}) => `${baseStyle} ${isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}>
        <CalendarCheck size={28} /> 
        <span className="text-xs font-semibold">Metas</span>
      </NavLink>
            <NavLink to="/progreso" className={({isActive}) => `${baseStyle} ${isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}>
                <Sun size={34} /> {/* O el ícono que elijas */}
      </NavLink>
      <NavLink to="/muro" className={({isActive}) => `${baseStyle} ${isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}>
        <Users size={28} />
        <span className="text-xs font-semibold">Muro</span>
      </NavLink>
      <NavLink to="/settings" className={({isActive}) => `${baseStyle} ${isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}>
        <Settings size={28} />
        <span className="text-xs font-semibold">Ajustes</span>
      </NavLink>
    </nav>
  );
}
// src/components/Navbar.jsx

import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Sun, Users, Settings } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const homeRelatedPaths = ['/home', '/tracking'];
  const isHomeActive = homeRelatedPaths.includes(location.pathname) || location.pathname.startsWith('/journal');

  const baseStyle = "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200";

  return (
    <nav className="flex-shrink-0 w-full h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] border-t border-zinc-200 flex justify-around items-stretch px-2">
      
      <NavLink 
        to="/home" 
        className={`${baseStyle} ${isHomeActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}
      >
        <Home size={28} />
        <span className="text-xs font-semibold">Home</span>
      </NavLink>

      <NavLink to="/metas" className={({isActive}) => `${baseStyle} ${isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}>
        <ClipboardList size={28} /> 
        <span className="text-xs font-semibold">Metas</span>
      </NavLink>
      <NavLink to="/sunny" className={({isActive}) => `${baseStyle} ${isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'}`}>
        <Sun size={28} />
        <span className="text-xs font-semibold">Sunny</span>
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
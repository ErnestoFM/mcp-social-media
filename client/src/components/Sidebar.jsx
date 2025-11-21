import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, BarChart2, Share2, TrendingUp, Zap, MessageSquare, Instagram, Settings, LogOut, User, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Usuarios', icon: Users, href: '/usuarios' },
  { name: 'Cuentas', icon: Instagram, href: '/cuentas' },
  { name: 'Analíticas', icon: BarChart2, href: '/analiticas' },
  { name: 'Redes Sociales', icon: Share2, href: '/redes' },
  // Tus nuevas secciones
  { name: 'Inspírate', icon: Zap, href: '/inspirate', special: true },
  { name: 'Chat IA', icon: MessageSquare, href: '/chat', special: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-[#1e293b] text-white flex flex-col shadow-xl fixed left-0 top-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h1 className="font-bold text-lg">Admin Panel</h1>
        <button className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors
                  ${item.special ? 'text-blue-400 hover:text-blue-300' : 'text-slate-300'}
                `}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Menu at Bottom */}
      <div className="border-t border-slate-700">
        {/* User Menu Toggle */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-colors text-slate-300"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User size={18} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-slate-400">{user?.email || 'email@ejemplo.com'}</p>
          </div>
          <ChevronUp
            size={16}
            className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="bg-slate-800 border-t border-slate-700">
            <Link
              to="/configuracion"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-slate-300"
              onClick={() => setShowUserMenu(false)}
            >
              <Settings size={18} />
              <span className="text-sm">Configuración</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-red-400 hover:text-red-300"
            >
              <LogOut size={18} />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
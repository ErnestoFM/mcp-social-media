import Link from 'next/link';
import { LayoutDashboard, Package, Users, BarChart2, Share2, TrendingUp, Zap, MessageSquare } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Productos', icon: Package, href: '/productos' },
  { name: 'Usuarios', icon: Users, href: '/usuarios' },
  { name: 'Analíticas', icon: BarChart2, href: '/analiticas' },
  { name: 'Redes Sociales', icon: Share2, href: '/redes' },
  { name: 'Tráfico Web', icon: TrendingUp, href: '/trafico' },
  // Tus nuevas secciones
  { name: 'Inspírate', icon: Zap, href: '/inspirate', special: true }, 
  { name: 'Chat IA', icon: MessageSquare, href: '/chat', special: true },
];

export default function Sidebar() {
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
                href={item.href}
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
    </div>
  );
}
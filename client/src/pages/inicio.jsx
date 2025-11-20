import { Users, ShoppingBag, Eye } from 'lucide-react';

// Componente reutilizable para las tarjetas
const StatCard = ({ title, value, colorClass, borderClass }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${borderClass} flex flex-col justify-between h-32`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-slate-800">{value}</span>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Productos" 
          value="248" 
          borderClass="border-blue-500" 
        />
        <StatCard 
          title="Usuarios Activos" 
          value="1,432" 
          borderClass="border-green-500" 
        />
        <StatCard 
          title="Visitas Hoy" 
          value="3,891" 
          borderClass="border-purple-500" 
        />
      </div>

      {/* Espacio para gráficos o tablas futuras */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm min-h-[300px]">
        <h2 className="text-lg font-semibold mb-4">Resumen de Actividad</h2>
        <p className="text-gray-400 text-sm">Aquí irían las gráficas (Chart.js o Recharts)...</p>
      </div>
    </div>
  );
}
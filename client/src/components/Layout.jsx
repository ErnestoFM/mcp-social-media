// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';  // ← Cambiar ./components/Sidebar por ./Sidebar

const Layout = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* El Sidebar se mantiene fijo */}
      <Sidebar />
      
      {/* El main es el contenido dinámico que cambia según la ruta */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* <Outlet /> renderiza el componente de la ruta hija seleccionada */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
// client/src/Router.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// 1. Importar Layout y Guard desde 'components'
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

// 2. Importar tus Vistas (Ajusta la ruta según donde estén inicio.jsx y chat.jsx)
// Si están en una carpeta 'pages', usa './pages/inicio'. Si están en 'src' directo, usa './inicio'
import Inicio from './pages/inicio'; 
import Chat from './pages/chat';
import Login from './pages/login'; // La que acabamos de crear

const Router = () => {
    return (
        <Routes>
            {/* Ruta Pública: Login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas Privadas: Envueltas en AuthGuard y Layout */}
            <Route element={<AuthGuard />}>
                <Route element={<Layout />}>
                    
                    {/* "inicio.jsx" será tu Dashboard */}
                    <Route path="/" element={<Inicio />} />
                    
                    {/* "chat.jsx" será tu Chat IA */}
                    <Route path="/chat" element={<Chat />} />
                    
                    {/* Placeholder para rutas futuras */}
                    <Route path="/inspirate" element={<div>Sección Inspírate</div>} />
                    
                </Route>
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default Router;
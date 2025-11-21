// client/src/Router.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

// Layouts
import LandingLayout from './pages/LandingLayout';

// Pages
import Analytics from './pages/Analytics';
import Inicio from './pages/inicio';
import Chat from './pages/chat';
import Login from './pages/login';
import Register from './pages/Register';
import UsersPage from './pages/Users';
import Cuentas from './pages/Cuentas';
import Configuracion from './pages/Configuracion';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import HomeLanding from './pages/HomeLanding';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Guide from './pages/Guide';
import Pricing from './pages/Pricing';
import RedesSociales from './pages/RedesSociales';
import Gemini from './pages/Gemini'


const Router = () => {
    return (
        <Routes>
            {/* Rutas Públicas (Landing Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<LandingLayout />}>
                <Route path="/" element={<HomeLanding />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />

                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/guide" element={<Guide />} />

                <Route path="/access-denied" element={<AccessDenied />} />
            </Route>

            {/* Rutas Privadas (Dashboard Layout + AuthGuard) */}
            <Route element={<Layout />}>
                <Route element={<AuthGuard />}>
                    <Route path="/dashboard" element={<Inicio />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/analiticas" element={<Analytics />} />
                    <Route path="/usuarios" element={<UsersPage />} />
                    <Route path="/cuentas" element={<Cuentas />} />
                    <Route path="/redes" element={<RedesSociales />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                    <Route path="/inspirate" element={<Gemini />} />

                    {/* 404 dentro del layout del dashboard para usuarios logueados */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>

            {/* Fallback global: Si no coincide con nada, intentar ir al home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default Router;
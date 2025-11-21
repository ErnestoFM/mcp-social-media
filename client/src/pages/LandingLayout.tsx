// client/src/views/LandingLayout.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Footer from '../components/Footer.tsx';

const LandingLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* --- Navbar Pública --- */}
            <header className="bg-white shadow-md z-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="text-xl font-bold text-indigo-600">
                        MCP Agent 🤖
                    </div>
                    <nav className="flex space-x-4 items-center">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">
                            Inicio
                        </Link>
                        <Link to="/about" className="text-gray-600 hover:text-indigo-600 font-medium">
                            Acerca de
                        </Link>
                        {/* Botón de Login/Dashboard */}
                        <Link
                            to="/login"
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            <LogIn size={18} />
                            Entrar
                        </Link>
                    </nav>
                </div>
            </header>

            {/* --- Contenido de la Página --- */}
            {/* main con w-full para permitir diseños full-width como el Hero */}
            <main className="w-full flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default LandingLayout;
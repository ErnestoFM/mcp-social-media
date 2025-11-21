
// client/src/views/NotFound.tsx
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Asumimos que quieres usar el contexto de Auth

const NotFound = () => {
    // Usamos el contexto de autenticación para saber si debemos mandar al usuario al login o al dashboard.
    const { isAuthenticated } = useAuth();
    const isLoggedIn = isAuthenticated();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="text-center bg-white p-10 md:p-16 rounded-xl shadow-2xl border border-gray-100 max-w-lg">

                {/* Ícono de Error */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-600 mb-6">
                    <ShieldAlert size={48} />
                </div>

                {/* Mensaje Principal */}
                <h1 className="text-7xl md:text-9xl font-extrabold text-indigo-600 tracking-wider">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-3">
                    ¡Página No Encontrada!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                    Parece que la URL que buscas ha sido movida o nunca existió.
                    No te preocupes, esto es solo un error del sistema.
                </p>

                {/* Opciones de Escape */}
                <div className="flex flex-col space-y-4">
                    {/* Si está logueado, lo mandamos al Dashboard */}
                    {isLoggedIn ? (
                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                        >
                            <Home size={20} className="mr-2" />
                            Ir al Dashboard
                        </Link>
                    ) : (
                        /* Si no está logueado, lo mandamos al Login */
                        <Link
                            to="/login"
                            className="flex items-center justify-center bg-green-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-green-700 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Volver al Login
                        </Link>
                    )}

                    {/* Ruta de soporte o contacto */}
                    <p className="text-sm text-gray-500 pt-2">
                        Si crees que esto es un error, contacta a soporte.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AccessDenied = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <Lock size={48} className="text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6 max-w-md">
                No has iniciado sesión o no tienes permisos para ver esta página.
                Por favor, identifícate para continuar.
            </p>
            <Link
                to="/login"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
            >
                Iniciar Sesión
            </Link>
        </div>
    );
};

export default AccessDenied;

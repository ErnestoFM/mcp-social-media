// client/src/components/AuthGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate que la ruta al contexto sea correcta

const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>; // O tu componente de Loading

  if (!isAuthenticated()) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
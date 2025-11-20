// client/src/login.jsx (o donde tengas tus otras vistas)
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Login MCP</h1>
        <button 
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Ingresar
        </button>
      </div>
    </div>
  );
};

export default Login;
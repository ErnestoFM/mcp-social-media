import { BrowserRouter } from 'react-router-dom';
// @ts-ignore: No declaration file for './context/AuthContext'
import { AuthProvider } from './context/AuthContext';
// @ts-ignore: No declaration file for './Router'
import Router from './Router';
import { Helmet } from 'react-helmet';

function App() {
  // Nota: El contenido de la aplicación debe estar dentro de un solo contenedor o Fragmento.

  return (
    <AuthProvider>
      <Helmet> {/* <- Helmet se mueve dentro del return */}
        <title>{import.meta.env.VITE_APP_NAME || 'MCP'}</title>
        <meta name="description" content="Herramienta de Intelgencia Artificial para hacer crecer tu marca." />
      </Helmet>

      <div className="min-h-screen bg-gray-100">
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
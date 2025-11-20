import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado simulado del usuario
  const [user, setUser] = useState(null);

  // Simular inicio de sesión
  const login = () => {
    const fakeUser = {
      name: 'Ernesto López',
      email: 'ernesto@eclothe.mx',
    };
    setUser(fakeUser);
  };

  // Simular cierre de sesión
  const logout = () => {
    setUser(null);
  };

  // Verificar si está autenticado
  const isAuthenticated = () => !!user;

  // Simular carga (puedes usarlo para pantallas de carga)
  const isLoading = false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

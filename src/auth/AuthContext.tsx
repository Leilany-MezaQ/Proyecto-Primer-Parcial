import { createContext, useContext, useState, useEffect } from 'react';
import type { Role } from '@/components/types';

interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const storedUser =
      localStorage.getItem('authUser') || sessionStorage.getItem('authUser');

    if (storedToken) setToken(storedToken);

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        console.warn('Error al parsear el usuario guardado');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;

    storage.setItem('authToken', newToken);
    storage.setItem('authUser', JSON.stringify(userData));
    storage.setItem('userId', userData.id); // Guardamos el ID del usuario

    console.log('User ID guardado:', userData.id); // Debug opcional

    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('userId');

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('userId');

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/axios.ts';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginUser: (credentials: any) => Promise<void>;
  registerUser: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('coffee_token');
    const savedUser = localStorage.getItem('coffee_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('coffee_token', receivedToken);
    localStorage.setItem('coffee_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
  };

  const registerUser = async (userData: any) => {
    await api.post('/auth/register', userData);
  };

  const logout = () => {
    localStorage.removeItem('coffee_token');
    localStorage.removeItem('coffee_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, registerUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return context;
}

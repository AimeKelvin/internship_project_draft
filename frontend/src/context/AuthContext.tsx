import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import type { User, UserRole } from '../types';
import api from '../api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from stored JWT token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        setUser({
          id: Number(payload.id),                    // Keep as number to match types
          username: payload.username,
          role: payload.role as UserRole,
          full_name: payload.username,               // fallback
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Invalid token on init');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const userData = await api.auth.login(username, password);

      setUser({
        id: Number(userData.id),
        username: userData.username,
        role: userData.role as UserRole,
        full_name: userData.username,                 // backend doesn't return full_name
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Login failed',
      };
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const userData = await api.auth.register(username, password);

      setUser({
        id: Number(userData.id || 0),
        username: userData.username,
        role: 'manager' as UserRole,                  // signup always creates manager
        full_name: userData.username,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Registration failed',
      };
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
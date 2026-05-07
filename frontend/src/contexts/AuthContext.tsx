import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';
import { disconnectSocket } from '../services/socketService';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  skill_level?: number;
  sport_preferences?: string[];
  avatar?: string;
  phone?: string;
  primary_sport?: string;
  location?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  token: null,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const token = authService.getToken();

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile as AuthUser);
    } catch {
      // Token is invalid or expired — clear it
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    authService.logout();
    disconnectSocket();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

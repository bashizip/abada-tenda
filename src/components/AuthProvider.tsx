import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthState, getStoredAuth, setAuth, clearAuth, User } from '@/lib/auth';
import { apiClient, LoginRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ApiErrorToast } from './ApiErrorToast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getStoredAuth);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setLoading(true);
    const response = await apiClient.login(credentials);
    setLoading(false);

    if (response.data) {
      const { token, user } = response.data;
      setAuth(token, user);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.username}`,
      });
      
      return true;
    } else {
      toast(ApiErrorToast({ error: response.error, defaultMessage: "Invalid credentials" }));
      return false;
    }
  };

  const logout = () => {
    clearAuth();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  useEffect(() => {
    // Check for stored auth on mount
    const stored = getStoredAuth();
    setAuthState(stored);
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

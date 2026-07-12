import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api';

interface AuthContextValue {
  token: string | null;
  usuario: string | null;
  needsSetup: boolean | null;
  loading: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  setup: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshSetupStatus: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [usuario, setUsuario] = useState<string | null>(
    () => localStorage.getItem('usuario')
  );
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSetupStatus = useCallback(async () => {
    const { data } = await authApi.setupStatus();
    setNeedsSetup(data.needsSetup);
  }, []);

  useEffect(() => {
    refreshSetupStatus()
      .catch(() => setNeedsSetup(false))
      .finally(() => setLoading(false));
  }, [refreshSetupStatus]);

  const persistAuth = useCallback((newToken: string, newUsuario: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', newUsuario);
    setToken(newToken);
    setUsuario(newUsuario);
    setNeedsSetup(false);
  }, []);

  const login = useCallback(
    async (user: string, senha: string) => {
      const { data } = await authApi.login(user, senha);
      persistAuth(data.token, data.usuario);
    },
    [persistAuth]
  );

  const setup = useCallback(
    async (user: string, senha: string) => {
      const { data } = await authApi.setup(user, senha);
      persistAuth(data.token, data.usuario);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      usuario,
      needsSetup,
      loading,
      login,
      setup,
      logout,
      refreshSetupStatus,
      isAuthenticated: !!token,
    }),
    [token, usuario, needsSetup, loading, login, setup, logout, refreshSetupStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

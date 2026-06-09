import { createContext, useContext, useEffect, useState } from 'react';

import { getCurrentUser } from '../api/auth.api';
import {
  clearSession,
  getSession,
  saveSession,
} from '../utils/auth';
import { getErrorMessage, showErrorToast } from '../utils/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootSession = async () => {
      const storedSession = getSession();

      if (!storedSession?.token) {
        setIsBootstrapping(false);
        return;
      }

      setSession(storedSession);

      try {
        const response = await getCurrentUser();
        const nextSession = {
          ...storedSession,
          user: response.data,
        };

        saveSession(nextSession);
        setSession(nextSession);
      } catch (error) {
        clearSession();
        setSession(null);
        showErrorToast(getErrorMessage(error, 'La sesión guardada ya no es válida.'));
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootSession();
  }, []);

  const login = (authData) => {
    saveSession(authData);
    setSession(authData);
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const value = {
    session,
    token: session?.token || null,
    user: session?.user || null,
    isAuthenticated: Boolean(session?.token),
    isBootstrapping,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

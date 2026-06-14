import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token desde SecureStore al iniciar
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        if (savedToken) {
          setAccessToken(savedToken);
        }
      } catch (error) {
        console.error('Error al cargar token desde SecureStore:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Guardar token en SecureStore cuando cambia
  const handleSetAccessToken = (token: string | null) => {
    setAccessToken(token);
    if (token) {
      SecureStore.setItemAsync('token', token).catch((e) => console.error('Error guardando token:', e));
    } else {
      SecureStore.deleteItemAsync('token').catch((e) => console.error('Error removiendo token:', e));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken: handleSetAccessToken,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

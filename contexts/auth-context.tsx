import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

type AuthContextType = {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => void;
  signUp: (userData: any) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = (email: string, password: string) => {
    // TODO: Implement actual authentication logic
    setIsAuthenticated(true);
    router.replace('/(tabs)');
  };

  const signUp = (userData: any) => {
    // TODO: Implement actual registration logic
    setIsAuthenticated(true);
    router.replace('/(tabs)');
  };

  const signOut = () => {
    setIsAuthenticated(false);
    router.replace('/auth/sign-in');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
        signUp,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
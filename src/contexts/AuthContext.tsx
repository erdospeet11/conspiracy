'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // TODO: Implement actual sign in
    setUser({ id: '1', email });
  };

  const signUp = async (email: string, password: string) => {
    // TODO: Implement actual sign up
    setUser({ id: '1', email });
  };

  const signOut = async () => {
    setUser(null);
  };

  const signInWithGoogle = async () => {
    // TODO: Implement actual Google sign in
    setUser({ 
      id: '2', 
      email: 'user@example.com',
      name: 'Google User',
      photoURL: 'https://via.placeholder.com/150'
    });
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
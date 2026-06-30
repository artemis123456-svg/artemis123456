import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  authError: string | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAuthorization = async (currentUser: User): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .select('email')
        .eq('email', currentUser.email || '')
        .maybeSingle();

      if (error) {
        console.error('Error checking authorization:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Unexpected error checking authorization:', err);
      return false;
    }
  };

  const handleUserSession = async (currentSession: Session | null) => {
    setAuthError(null);
    if (!currentSession || !currentSession.user) {
      setSession(null);
      setUser(null);
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    const currentUser = currentSession.user;
    const authorized = await checkAuthorization(currentUser);

    if (authorized) {
      setSession(currentSession);
      setUser(currentUser);
      setIsAuthorized(true);
      setAuthError(null);
      setLoading(false);
    } else {
      // Not authorized!
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAuthorized(false);
      setAuthError('Tu email no está autorizado para acceder a este CRM. Contacta con el administrador.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleUserSession(initialSession);
    }).catch((err) => {
      console.error('Error getting initial session:', err);
      setLoading(false);
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setLoading(true);
        await handleUserSession(currentSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Checking authorization will be handled automatically by the onAuthStateChange listener,
    // but we can check it here as well if we want immediate feedback.
    if (data.user) {
      const authorized = await checkAuthorization(data.user);
      if (!authorized) {
        await supabase.auth.signOut();
        const noAuthError = new Error('Tu email no está autorizado para acceder a este CRM. Contacta con el administrador.');
        setAuthError(noAuthError.message);
        return { error: noAuthError };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAuthorized(false);
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAuthorized,
        authError,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

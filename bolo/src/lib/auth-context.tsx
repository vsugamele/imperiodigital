"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type User = { id: string; email: string; company_name?: string };
type AuthContextType = { user: User | null; loading: boolean; error: string | null; login: any; register: any; logout: any };

const AuthContext = createContext<AuthContextType | null>(null);

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email! });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (email: string, password: string, company_name: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.auth.signUp({ 
      email, password, options: { data: { company_name } } 
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth required');
  return context;
}

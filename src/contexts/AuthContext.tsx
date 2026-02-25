import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isEmailVerified: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, profession: 'student' | 'professional') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (profession?: 'student' | 'professional') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isVerifiedUser = (authUser: User | null) => {
    if (!authUser) return false;
    return !!(authUser.email_confirmed_at || authUser.confirmed_at);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && !isVerifiedUser(session.user)) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // After Google sign-in, update profile with stored profession
        if (event === 'SIGNED_IN' && session?.user) {
          const storedProfession = localStorage.getItem('google_signup_profession');
          if (storedProfession) {
            localStorage.removeItem('google_signup_profession');
            // Update the profile's profession
            setTimeout(async () => {
              await supabase
                .from('profiles')
                .update({ profession: storedProfession })
                .eq('user_id', session.user.id);
            }, 500);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !isVerifiedUser(session.user)) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, profession: 'student' | 'professional') => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          profession: profession,
        }
      }
    });

    // Prevent accidental access if session appears before verification is complete.
    if (!error && (data?.session || (data?.user && !isVerifiedUser(data.user as User)))) {
      await supabase.auth.signOut();
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async (profession?: 'student' | 'professional') => {
    // Store profession in localStorage so we can update profile after redirect
    if (profession) {
      localStorage.setItem('google_signup_profession', profession);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isEmailVerified = isVerifiedUser(user);

  return (
    <AuthContext.Provider value={{ user, session, isEmailVerified, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

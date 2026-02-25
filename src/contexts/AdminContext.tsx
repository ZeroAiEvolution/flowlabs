import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'moderator' | 'user' | null;

interface AdminContextType {
  isAdmin: boolean;
  role: AppRole;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent a race where auth hasn't finished initializing yet.
    // If we mark admin loading as false too early, AdminLayout can redirect
    // before the role check completes.
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setRole(null);
      setLoading(false);
    }
  }, [user, authLoading]);

  const checkAdminStatus = async () => {
    if (!user) return;

    setLoading(true);

    // Query roles (robust against response shape + supports multiple role rows)
    const { data, error } = await supabase
      .from('user_roles' as any)
      .select('role')
      .eq('user_id', user.id);

    if (error || !data) {
      console.error('[AdminContext] Error fetching roles:', error);
      setRole(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const roles: AppRole[] = Array.isArray(data)
      ? (data as any[]).map((r) => r?.role as AppRole).filter(Boolean)
      : [((data as any).role as AppRole) ?? null].filter(Boolean);

    const admin = roles.includes('admin');
    console.log('[AdminContext] Checked Roles:', roles, 'Is Admin:', admin);
    setIsAdmin(admin);
    // Prefer showing 'admin' if present; otherwise first role.
    setRole(admin ? 'admin' : roles[0] ?? null);

    setLoading(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, role, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

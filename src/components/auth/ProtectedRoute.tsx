import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { user, loading, isEmailVerified } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Checking authentication...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to login page, but save the location they were trying to access
        // (if we ever want to implement redirect-after-login)
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!isEmailVerified) {
        return <Navigate to="/?verify=1" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

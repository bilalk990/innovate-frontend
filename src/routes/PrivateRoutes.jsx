import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * PrivateRoutes — wraps pages that require authentication + role check
 */
export default function PrivateRoutes({ children, allowedRoles = [] }) {
    const { isAuthenticated, user } = useAuth();

    // Debug logging to help identify auth issues
    if (import.meta.env.DEV) {
        console.log('[PrivateRoutes] Auth Check:', {
            isAuthenticated,
            user,
            userRole: user?.role,
            allowedRoles,
            hasRole: user?.role ? allowedRoles.includes(user.role) : false
        });
    }

    if (!isAuthenticated) {
        console.warn('[PrivateRoutes] Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        console.error('[PrivateRoutes] Access denied:', {
            userRole: user?.role,
            allowedRoles,
            user
        });
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

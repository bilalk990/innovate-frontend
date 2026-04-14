import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * PrivateRoutes — wraps pages that require authentication + role check
 */
export default function PrivateRoutes({ children, allowedRoles = [] }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

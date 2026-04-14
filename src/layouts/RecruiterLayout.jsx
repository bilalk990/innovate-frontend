import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import DashboardLayout from '../components/DashboardLayout';

export default function RecruiterLayout() {
    const { user } = useAuth();
    const location = useLocation();

    // Refactored Elite Guard
    if (user && user.is_profile_complete === false && location.pathname !== '/recruiter/profile-setup') {
        return <Navigate to="/recruiter/profile-setup" replace />;
    }

    return <DashboardLayout />;
}

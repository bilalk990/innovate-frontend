import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import DashboardLayout from '../components/DashboardLayout';

export default function CandidateLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user && user.is_profile_complete === false) {
            if (location.pathname !== '/candidate/profile-setup') {
                navigate('/candidate/profile-setup', { replace: true });
            }
        }
    }, [user, location.pathname, navigate]);

    return <DashboardLayout />;
}

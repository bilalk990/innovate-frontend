import { useAuthStore } from '../store';
import authService from '../services/authService';

/**
 * useAuth — Clean hook that exposes auth state & helpers
 * Usage: const { user, token, login, logout, isRole, refreshUser } = useAuth();
 */
export default function useAuth() {
    const { user, token, setAuth, logout, isRole, hasHydrated } = useAuthStore();

    const login = (userData, jwtToken) => setAuth(userData, jwtToken);

    const refreshUser = async () => {
        try {
            const { data } = await authService.getProfile();
            setAuth(data, token);
            return data;
        } catch (err) {
            throw err;
        }
    };

    return {
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isRole,
        refreshUser,
        hasHydrated,
    };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store — manages JWT token and user state.
 *
 * Security note (#48): Token is stored in localStorage for simplicity.
 * For production with high security requirements, consider:
 * - httpOnly cookies (requires backend session endpoint changes)
 * - sessionStorage (token lost on tab close — more secure but less convenient)
 * Current approach is standard for SPAs and acceptable with proper XSS prevention (CSP headers added).
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('auth-store');
                set({ user: null, token: null });
            },

            hasHydrated: false,
            setHasHydrated: (state) => set({ hasHydrated: state }),

            isAuthenticated: () => !!get().token,
            isRole: (role) => get().user?.role === role,

            // Update user fields without full re-auth
            updateUser: (updates) => set((s) => ({
                user: s.user ? { ...s.user, ...updates } : null
            })),
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({ user: state.user, token: state.token }),
            onRehydrateStorage: () => (state) => {
                state.setHasHydrated(true);
            }
        }
    )
);

export default useAuthStore;

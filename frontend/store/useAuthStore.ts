import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { UserRole } from '../constants';
import { api } from '../services/mockApi'; // same API used earlier

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, role) => {
        try {
          set({ loading: true, error: null });
          const userData = await api.login(email, role);
          set({ user: userData, loading: false });
        } catch (err) {
          set({ error: 'Login failed. Please try again.', loading: false });
        }
      },

      logout: () => {
        set({ user: null });
        localStorage.removeItem('user');
      },
    }),
    {
      name: 'auth-storage', // name for localStorage key
    }
  )
);

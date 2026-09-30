import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId?: number | null;
  set: (data: {
    accessToken: string | null;
    refreshToken: string | null;
    userId?: number | null;
  }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,

      set: ({ accessToken, refreshToken, userId }) =>
        set(() => ({ accessToken, refreshToken, userId })),

      clear: () =>
        set(() => ({
          accessToken: null,
          refreshToken: null,
          userId: null
        }))
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId
      })
    }
  )
);

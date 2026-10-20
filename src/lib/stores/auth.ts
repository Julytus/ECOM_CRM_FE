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

      clear: () => {
        // Clear localStorage
        try {
          localStorage.removeItem("auth-storage");
        } catch (e) {
          console.error("Failed to clear localStorage:", e);
        }

        // Clear all cookies related to auth
        try {
          const cookies = document.cookie.split(";");
          cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

            if (name.toLowerCase().includes("token") || name.toLowerCase().includes("auth")) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            }
          });
        } catch (e) {
          console.error("Failed to clear cookies:", e);
        }

        return set(() => ({
          accessToken: null,
          refreshToken: null,
          userId: null
        }));
      }
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


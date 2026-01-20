import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook để quản lý authentication
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getCurrentUser,
    isUserAdmin,
    isUserManager,
    restoreSession,
  } = useAuthStore();

  // Khôi phục auth state từ localStorage khi app khởi động
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getCurrentUser,
    isUserAdmin,
    isUserManager,
  };
};

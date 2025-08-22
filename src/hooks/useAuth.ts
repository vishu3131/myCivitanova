import { useAuthWithRole } from './useAuthWithRole';

// Simple wrapper around useAuthWithRole for components that only need user info
export function useAuth() {
  const { user, loading } = useAuthWithRole();
  
  return {
    user,
    loading,
    isAuthenticated: !!user
  };
}

export type { AuthUser } from './useAuthWithRole';
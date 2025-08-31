import { useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook optimizado para usar el contexto de autenticación
 * Evita re-renders innecesarios y proporciona valores memoizados
 */
export const useAuthOptimized = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthOptimized must be used within an AuthProvider');
  }

  // Memoizar el contexto para evitar re-renders innecesarios
  const memoizedContext = useMemo(() => ({
    user: context.user,
    login: context.login,
    register: context.register,
    logout: context.logout,
    loading: context.loading,
    error: context.error,
    debugToken: context.debugToken,
    // Valores computados memoizados
    isAuthenticated: !!context.user,
    userType: context.user?.type,
    userName: context.user?.name,
    userEmail: context.user?.email,
    isCompany: context.user?.type === 'empresa',
    isClient: context.user?.type === 'cliente'
  }), [
    context.user,
    context.login,
    context.register,
    context.logout,
    context.loading,
    context.error,
    context.debugToken
  ]);

  return memoizedContext;
};

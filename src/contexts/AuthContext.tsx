import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  canAccess: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const roleHierarchy: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  technician: 2,
  receptionist: 1
};

const sectionPermissions: Record<string, UserRole[]> = {
  dashboard: ['admin', 'manager', 'technician', 'receptionist'],
  repairs: ['admin', 'manager', 'technician', 'receptionist'],
  clients: ['admin', 'manager', 'receptionist'],
  inventory: ['admin', 'manager'],
  warehouse: ['admin', 'manager'],
  technicians: ['admin', 'manager'],
  schedule: ['admin', 'manager'],
  finance: ['admin', 'manager'],
  reports: ['admin', 'manager'],
  roles: ['admin'],
  settings: ['admin'],
  support: ['admin', 'manager', 'technician', 'receptionist']
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const initAuth = () => {
      const user = authService.getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false
      });
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const user = await authService.login(username, password);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userLevel = roleHierarchy[authState.user.role];
    
    return roles.some(role => userLevel >= roleHierarchy[role]);
  };

  const canAccess = (section: string): boolean => {
    if (!authState.user) return false;
    
    const allowedRoles = sectionPermissions[section];
    if (!allowedRoles) return true;
    
    return allowedRoles.includes(authState.user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        hasPermission,
        canAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
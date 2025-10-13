import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface PermissionProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  section?: string;
  fallback?: ReactNode;
}

const Permission = ({ children, requiredRole, section, fallback = null }: PermissionProps) => {
  const { hasPermission, canAccess } = useAuth();

  if (requiredRole && !hasPermission(requiredRole)) {
    return <>{fallback}</>;
  }

  if (section && !canAccess(section)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Permission;

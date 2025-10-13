import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  section?: string;
}

const ProtectedRoute = ({ children, requiredRole, section }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, hasPermission, canAccess, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="ShieldAlert" className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Доступ запрещён</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              У вас недостаточно прав для доступа к этому разделу.
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Ваша роль:</div>
              <div className="text-sm text-muted-foreground">
                {user?.role === 'admin' && '👑 Администратор'}
                {user?.role === 'manager' && '💼 Менеджер'}
                {user?.role === 'technician' && '🔧 Техник'}
                {user?.role === 'receptionist' && '📋 Администратор'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.history.back()} variant="outline" className="flex-1">
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Назад
              </Button>
              <Button onClick={logout} variant="destructive" className="flex-1">
                <Icon name="LogOut" className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section && !canAccess(section)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon name="Lock" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Раздел недоступен</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Этот раздел недоступен для вашей роли.
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Раздел:</div>
              <div className="text-sm text-muted-foreground capitalize">{section}</div>
            </div>
            <Button onClick={() => window.history.back()} variant="outline" className="w-full">
              <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Вернуться
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

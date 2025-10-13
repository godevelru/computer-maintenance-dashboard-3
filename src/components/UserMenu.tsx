import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleInfo = (role: string) => {
    const info: Record<string, { label: string; color: string; icon: string }> = {
      admin: { label: 'Администратор', color: 'bg-red-100 text-red-700 border-red-200', icon: 'Shield' },
      manager: { label: 'Менеджер', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'Briefcase' },
      technician: { label: 'Техник', color: 'bg-green-100 text-green-700 border-green-200', icon: 'Wrench' },
      receptionist: { label: 'Администратор', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'UserCheck' }
    };
    return info[role] || info.receptionist;
  };

  const roleInfo = getRoleInfo(user.role);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Никогда';
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 h-auto py-2">
            <div className={`h-8 w-8 rounded-full ${roleInfo.color} flex items-center justify-center font-semibold text-sm`}>
              {getInitials(user.fullName)}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium leading-none mb-1">{user.fullName}</div>
              <Badge variant="outline" className={`${roleInfo.color} text-xs`}>
                {roleInfo.label}
              </Badge>
            </div>
            <Icon name="ChevronDown" className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full ${roleInfo.color} flex items-center justify-center font-bold`}>
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <Icon name="User" className="mr-2 h-4 w-4" />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="Settings" className="mr-2 h-4 w-4" />
            Настройки
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="Bell" className="mr-2 h-4 w-4" />
            Уведомления
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <Icon name="LogOut" className="mr-2 h-4 w-4" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Профиль пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`h-20 w-20 rounded-full ${roleInfo.color} flex items-center justify-center font-bold text-2xl`}>
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.fullName}</h3>
                <Badge variant="outline" className={`${roleInfo.color} mt-1`}>
                  <Icon name={roleInfo.icon} className="mr-1 h-3 w-3" />
                  {roleInfo.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID пользователя</span>
                <span className="text-sm font-mono">{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Логин</span>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Создан</span>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Последний вход</span>
                <span className="text-sm">{formatDate(user.lastLogin)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Права доступа</div>
              <div className="space-y-1">
                {user.role === 'admin' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Полный доступ ко всем разделам
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Управление пользователями
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Финансы и настройки
                    </div>
                  </>
                )}
                {user.role === 'manager' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Заявки и клиенты
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Склад и техники
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Финансы и отчёты
                    </div>
                  </>
                )}
                {user.role === 'technician' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Просмотр и работа с заявками
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Просмотр дашборда
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="X" className="h-4 w-4 text-red-600" />
                      Управление финансами
                    </div>
                  </>
                )}
                {user.role === 'receptionist' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Приём заявок
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" className="h-4 w-4 text-green-600" />
                      Работа с клиентами
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="X" className="h-4 w-4 text-red-600" />
                      Управление складом
                    </div>
                  </>
                )}
              </div>
            </div>

            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Выйти из системы
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserMenu;

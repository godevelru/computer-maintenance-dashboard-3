import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { UserRole } from '@/types';
import CreateRoleDialog from './CreateRoleDialog';
import CreateUserDialog from './CreateUserDialog';

interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  color: string;
  icon: string;
  hierarchy: number;
  permissions: Record<string, boolean>;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  avatar: string;
  isActive: boolean;
}

const SECTIONS = [
  { id: 'dashboard', name: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'repairs', name: 'Заявки', icon: 'Wrench' },
  { id: 'clients', name: 'Клиенты', icon: 'Users' },
  { id: 'inventory', name: 'Инвентарь', icon: 'Package' },
  { id: 'warehouse', name: 'Склад', icon: 'Warehouse' },
  { id: 'technicians', name: 'Техники', icon: 'HardHat' },
  { id: 'schedule', name: 'График', icon: 'Calendar' },
  { id: 'finance', name: 'Финансы', icon: 'DollarSign' },
  { id: 'reports', name: 'Отчёты', icon: 'FileText' },
  { id: 'settings', name: 'Настройки', icon: 'Settings' },
];

const ACTIONS = [
  { id: 'view', name: 'Просмотр' },
  { id: 'create', name: 'Создание' },
  { id: 'edit', name: 'Редактирование' },
  { id: 'delete', name: 'Удаление' },
  { id: 'export', name: 'Экспорт' },
  { id: 'import', name: 'Импорт' },
];

const RolesManager = () => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      id: 'admin',
      name: 'Администратор',
      description: 'Полный доступ ко всем функциям системы',
      color: 'bg-red-500',
      icon: 'Crown',
      hierarchy: 4,
      permissions: Object.fromEntries(
        SECTIONS.flatMap(s => ACTIONS.map(a => [`${s.id}.${a.id}`, true]))
      )
    },
    {
      id: 'manager',
      name: 'Менеджер',
      description: 'Управление заявками, клиентами, складом и финансами',
      color: 'bg-blue-500',
      icon: 'Briefcase',
      hierarchy: 3,
      permissions: {
        'dashboard.view': true,
        'repairs.view': true, 'repairs.create': true, 'repairs.edit': true, 'repairs.delete': true,
        'clients.view': true, 'clients.create': true, 'clients.edit': true, 'clients.delete': true,
        'inventory.view': true, 'inventory.create': true, 'inventory.edit': true,
        'warehouse.view': true, 'warehouse.create': true, 'warehouse.edit': true,
        'technicians.view': true, 'technicians.create': true, 'technicians.edit': true,
        'schedule.view': true, 'schedule.create': true, 'schedule.edit': true,
        'finance.view': true, 'finance.create': true, 'finance.edit': true,
        'reports.view': true, 'reports.create': true, 'reports.export': true,
      }
    },
    {
      id: 'technician',
      name: 'Техник',
      description: 'Работа с заявками и просмотр информации',
      color: 'bg-orange-500',
      icon: 'Wrench',
      hierarchy: 2,
      permissions: {
        'dashboard.view': true,
        'repairs.view': true, 'repairs.edit': true,
        'schedule.view': true,
      }
    },
    {
      id: 'receptionist',
      name: 'Администратор (Ресепшн)',
      description: 'Приём заявок и работа с клиентами',
      color: 'bg-green-500',
      icon: 'ClipboardList',
      hierarchy: 1,
      permissions: {
        'dashboard.view': true,
        'repairs.view': true, 'repairs.create': true,
        'clients.view': true, 'clients.create': true, 'clients.edit': true,
      }
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      fullName: 'Иван Админов',
      role: 'admin',
      email: 'admin@service.ru',
      avatar: 'ИА',
      isActive: true
    },
    {
      id: '2',
      username: 'manager',
      fullName: 'Пётр Менеджеров',
      role: 'manager',
      email: 'manager@service.ru',
      avatar: 'ПМ',
      isActive: true
    },
    {
      id: '3',
      username: 'tech',
      fullName: 'Сергей Техников',
      role: 'technician',
      email: 'tech@service.ru',
      avatar: 'СТ',
      isActive: true
    },
    {
      id: '4',
      username: 'reception',
      fullName: 'Мария Ресепшн',
      role: 'receptionist',
      email: 'reception@service.ru',
      avatar: 'МР',
      isActive: true
    },
  ]);

  const currentRole = roles.find(r => r.id === selectedRole);

  const handlePermissionToggle = (section: string, action: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === selectedRole) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [`${section}.${action}`]: !role.permissions[`${section}.${action}`]
          }
        };
      }
      return role;
    }));

    toast({
      title: 'Права обновлены',
      description: `Изменения для роли "${currentRole?.name}" сохранены`,
    });
  };

  const handleUserRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast({
      title: 'Роль изменена',
      description: 'Роль пользователя успешно обновлена',
    });
  };

  const handleUserStatusToggle = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const handleCreateUser = (userData: {
    username: string;
    fullName: string;
    email: string;
    role: UserRole;
    password: string;
  }) => {
    const newUser: User = {
      id: String(users.length + 1),
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      avatar: userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
      isActive: true
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleCreateRole = (roleData: {
    name: string;
    description: string;
    color: string;
    icon: string;
    hierarchy: number;
  }) => {
    const newRole: RoleConfig = {
      id: roleData.name.toLowerCase().replace(/\s+/g, '_') as UserRole,
      name: roleData.name,
      description: roleData.description,
      color: roleData.color,
      icon: roleData.icon,
      hierarchy: roleData.hierarchy,
      permissions: {}
    };
    setRoles(prev => [...prev, newRole]);
  };

  const getRoleStats = (role: RoleConfig) => {
    const totalPermissions = SECTIONS.length * ACTIONS.length;
    const activePermissions = Object.values(role.permissions).filter(Boolean).length;
    const percentage = Math.round((activePermissions / totalPermissions) * 100);
    return { total: totalPermissions, active: activePermissions, percentage };
  };

  const getRoleBadge = (roleId: UserRole) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return null;
    return (
      <Badge className={`${role.color} text-white`}>
        {role.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Роли и права доступа</h2>
          <p className="text-muted-foreground mt-1">
            Управление ролями, правами доступа и пользователями системы
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateRoleDialogOpen(true)}>
          <Icon name="Plus" size={16} />
          Создать роль
        </Button>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="gap-2">
            <Icon name="Shield" size={16} />
            Роли
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Icon name="Key" size={16} />
            Права доступа
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Icon name="Users" size={16} />
            Пользователи
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Роли */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roles.map(role => {
              const stats = getRoleStats(role);
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === role.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center`}>
                        <Icon name={role.icon as any} size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Уровень {role.hierarchy}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {role.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Права доступа</span>
                        <span className="font-semibold">{stats.active}/{stats.total}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${role.color} transition-all`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {stats.percentage}% доступных функций
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(role.id);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="Copy" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Статистика по ролям */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика использования ролей</CardTitle>
              <CardDescription>Распределение пользователей по ролям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map(role => {
                  const userCount = users.filter(u => u.role === role.id).length;
                  const percentage = (userCount / users.length) * 100;
                  return (
                    <div key={role.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`} />
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {userCount} {userCount === 1 ? 'пользователь' : 'пользователей'}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${role.color} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Права доступа */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Настройка прав для роли: {currentRole?.name}</CardTitle>
                  <CardDescription>
                    Включайте и выключайте доступ к разделам и действиям
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {roles.map(role => (
                    <Button
                      key={role.id}
                      variant={selectedRole === role.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRole(role.id)}
                      className="gap-2"
                    >
                      <Icon name={role.icon as any} size={14} />
                      {role.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {SECTIONS.map(section => {
                    const sectionPermissions = ACTIONS.filter(
                      action => currentRole?.permissions[`${section.id}.${action.id}`]
                    );
                    return (
                      <div key={section.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name={section.icon as any} size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{section.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {sectionPermissions.length}/{ACTIONS.length} действий доступно
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-13">
                          {ACTIONS.map(action => {
                            const permKey = `${section.id}.${action.id}`;
                            const isEnabled = currentRole?.permissions[permKey] || false;
                            return (
                              <div
                                key={action.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  isEnabled 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border bg-background hover:bg-accent'
                                }`}
                              >
                                <Label 
                                  htmlFor={permKey}
                                  className="cursor-pointer flex-1 text-sm"
                                >
                                  {action.name}
                                </Label>
                                <Switch
                                  id={permKey}
                                  checked={isEnabled}
                                  onCheckedChange={() => handlePermissionToggle(section.id, action.id)}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Пользователи */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Пользователи системы</CardTitle>
                  <CardDescription>
                    Управление пользователями и назначение ролей
                  </CardDescription>
                </div>
                <Button className="gap-2" onClick={() => setIsUserDialogOpen(true)}>
                  <Icon name="UserPlus" size={16} />
                  Добавить пользователя
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map(user => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.fullName}</h4>
                            {getRoleBadge(user.role)}
                            {user.isActive ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Icon name="Check" size={12} className="mr-1" />
                                Активен
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <Icon name="X" size={12} className="mr-1" />
                                Заблокирован
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={12} />
                              {user.username}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Mail" size={12} />
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Icon name="Settings" size={14} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Настройки пользователя</DialogTitle>
                                <DialogDescription>
                                  Изменение роли и статуса {user.fullName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Роль пользователя</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {roles.map(role => (
                                      <Button
                                        key={role.id}
                                        variant={user.role === role.id ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleUserRoleChange(user.id, role.id)}
                                        className="gap-2 justify-start"
                                      >
                                        <Icon name={role.icon as any} size={14} />
                                        {role.name}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Статус аккаунта</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {user.isActive ? 'Активен' : 'Заблокирован'}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={user.isActive}
                                    onCheckedChange={() => handleUserStatusToggle(user.id)}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Быстрые фильтры */}
          <div className="grid gap-4 md:grid-cols-4">
            {roles.map(role => {
              const count = users.filter(u => u.role === role.id).length;
              return (
                <Card key={role.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center`}>
                        <Icon name={role.icon as any} size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">{role.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалоги */}
      <CreateRoleDialog
        open={isCreateRoleDialogOpen}
        onOpenChange={setIsCreateRoleDialogOpen}
        onCreateRole={handleCreateRole}
      />
      
      <CreateUserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        onCreateUser={handleCreateUser}
        roles={roles.map(r => ({ id: r.id, name: r.name, color: r.color, icon: r.icon }))}
      />
    </div>
  );
};

export default RolesManager;
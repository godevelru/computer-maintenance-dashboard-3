import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

const SECTIONS = [
  { id: 'dashboard', name: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'repairs', name: 'Заявки', icon: 'Wrench' },
  { id: 'clients', name: 'Клиенты', icon: 'Users' },
  { id: 'inventory', name: 'Инвентарь', icon: 'Package' },
  { id: 'warehouse', name: 'Склад', icon: 'Warehouse' },
  { id: 'technicians', name: 'Техники', icon: 'UserCheck' },
  { id: 'schedule', name: 'График', icon: 'Calendar' },
  { id: 'finance', name: 'Финансы', icon: 'DollarSign' },
  { id: 'reports', name: 'Отчёты', icon: 'FileText' },
  { id: 'roles', name: 'Роли и права', icon: 'Shield' },
  { id: 'settings', name: 'Настройки', icon: 'Settings' },
  { id: 'support', name: 'Поддержка', icon: 'HelpCircle' },
];

const getRoleBadge = (role: string) => {
  const configs: Record<string, { color: string; label: string }> = {
    admin: { color: 'bg-red-500', label: 'Администратор' },
    manager: { color: 'bg-blue-500', label: 'Менеджер' },
    technician: { color: 'bg-orange-500', label: 'Техник' },
    receptionist: { color: 'bg-green-500', label: 'Ресепшн' },
  };
  const config = configs[role] || { color: 'bg-gray-500', label: role };
  return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
};

const UserPermissionsCard = () => {
  const { user, canAccess } = useAuth();

  if (!user) return null;

  const accessibleSections = SECTIONS.filter(section => canAccess(section.id));
  const restrictedSections = SECTIONS.filter(section => !canAccess(section.id));

  const accessPercentage = Math.round((accessibleSections.length / SECTIONS.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ваши права доступа</CardTitle>
            <CardDescription>
              Разделы доступные для роли {user.role}
            </CardDescription>
          </div>
          {getRoleBadge(user.role)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Доступ к разделам</span>
            <span className="font-semibold">{accessibleSections.length}/{SECTIONS.length}</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
              style={{ width: `${accessPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {accessPercentage}% системы доступно
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} className="text-green-600" />
              Доступные разделы ({accessibleSections.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {accessibleSections.map(section => (
                <div 
                  key={section.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200"
                >
                  <Icon name={section.icon as any} size={14} className="text-green-600" />
                  <span className="text-xs text-green-700">{section.name}</span>
                </div>
              ))}
            </div>
          </div>

          {restrictedSections.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Icon name="Lock" size={16} className="text-red-600" />
                Ограниченные разделы ({restrictedSections.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {restrictedSections.map(section => (
                  <div 
                    key={section.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200"
                  >
                    <Icon name={section.icon as any} size={14} className="text-red-600" />
                    <span className="text-xs text-red-700">{section.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Info" size={14} />
            <span>Для расширения прав обратитесь к администратору</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionsCard;

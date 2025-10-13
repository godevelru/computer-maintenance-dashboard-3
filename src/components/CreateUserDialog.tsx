import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (user: {
    username: string;
    fullName: string;
    email: string;
    role: UserRole;
    password: string;
  }) => void;
  roles: Array<{
    id: UserRole;
    name: string;
    color: string;
    icon: string;
  }>;
}

const CreateUserDialog = ({ open, onOpenChange, onCreateUser, roles }: CreateUserDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'receptionist' as UserRole,
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = () => {
    if (!formData.username.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите логин пользователя',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.fullName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите полное имя пользователя',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный email',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен содержать минимум 6 символов',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    onCreateUser({
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      password: formData.password
    });

    setFormData({
      username: '',
      fullName: '',
      email: '',
      role: 'receptionist',
      password: '',
      confirmPassword: ''
    });
    onOpenChange(false);
    
    toast({
      title: 'Пользователь создан',
      description: `Пользователь ${formData.fullName} успешно добавлен`,
    });
  };

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить пользователя</DialogTitle>
          <DialogDescription>
            Создание нового пользователя системы
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-username">Логин *</Label>
              <Input
                id="user-username"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-fullname">Полное имя *</Label>
              <Input
                id="user-fullname"
                placeholder="Иван Иванов"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email *</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Роль *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${role.color}`} />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-password">Пароль *</Label>
              <Input
                id="user-password"
                type="password"
                placeholder="Минимум 6 символов"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-confirm-password">Повторите пароль *</Label>
              <Input
                id="user-confirm-password"
                type="password"
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {selectedRole && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedRole.color} flex items-center justify-center`}>
                  <Icon name={selectedRole.icon as any} size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{formData.fullName || 'Новый пользователь'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole.name} • {formData.email || 'email@example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            Создать пользователя
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;

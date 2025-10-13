import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRole: (role: {
    name: string;
    description: string;
    color: string;
    icon: string;
    hierarchy: number;
  }) => void;
}

const COLORS = [
  { value: 'bg-red-500', label: 'Красный' },
  { value: 'bg-blue-500', label: 'Синий' },
  { value: 'bg-green-500', label: 'Зелёный' },
  { value: 'bg-yellow-500', label: 'Жёлтый' },
  { value: 'bg-purple-500', label: 'Фиолетовый' },
  { value: 'bg-pink-500', label: 'Розовый' },
  { value: 'bg-orange-500', label: 'Оранжевый' },
  { value: 'bg-teal-500', label: 'Бирюзовый' },
];

const ICONS = [
  'Shield', 'Crown', 'Star', 'Briefcase', 'Wrench', 
  'Users', 'UserCheck', 'ClipboardList', 'Award', 'BadgeCheck'
];

const CreateRoleDialog = ({ open, onOpenChange, onCreateRole }: CreateRoleDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'Shield',
    hierarchy: 1
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название роли',
        variant: 'destructive'
      });
      return;
    }

    onCreateRole(formData);
    setFormData({
      name: '',
      description: '',
      color: 'bg-blue-500',
      icon: 'Shield',
      hierarchy: 1
    });
    onOpenChange(false);
    toast({
      title: 'Роль создана',
      description: `Роль "${formData.name}" успешно создана`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Создать новую роль</DialogTitle>
          <DialogDescription>
            Укажите параметры новой роли доступа
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Название роли *</Label>
            <Input
              id="role-name"
              placeholder="Например: Супервайзер"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Описание</Label>
            <Textarea
              id="role-description"
              placeholder="Краткое описание роли и её назначения"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Цвет</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Иконка</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(icon => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        <Icon name={icon as any} size={16} />
                        {icon}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-hierarchy">Уровень иерархии (1-10)</Label>
            <Input
              id="role-hierarchy"
              type="number"
              min="1"
              max="10"
              value={formData.hierarchy}
              onChange={(e) => setFormData({ ...formData, hierarchy: parseInt(e.target.value) || 1 })}
            />
            <p className="text-xs text-muted-foreground">
              Чем выше число, тем больше прав имеет роль
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${formData.color} flex items-center justify-center`}>
                <Icon name={formData.icon as any} size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{formData.name || 'Название роли'}</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.description || 'Описание роли'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            Создать роль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleDialog;

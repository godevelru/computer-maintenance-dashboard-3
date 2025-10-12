import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";

const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground">Управление параметрами системы</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" className="h-5 w-5" />
              Информация о компании
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Название организации</Label>
              <Input placeholder="ООО Ремонт Сервис" />
            </div>
            <div className="space-y-2">
              <Label>ИНН</Label>
              <Input placeholder="1234567890" />
            </div>
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input placeholder="г. Москва, ул. Примерная, 1" />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input placeholder="+7 (495) 123-45-67" />
            </div>
            <Button className="w-full">Сохранить изменения</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bell" className="h-5 w-5" />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">Получать письма о новых заявках</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS уведомления</Label>
                <p className="text-sm text-muted-foreground">Уведомления на телефон</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Уведомления о низких остатках</Label>
                <p className="text-sm text-muted-foreground">Когда запчасти заканчиваются</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Еженедельные отчеты</Label>
                <p className="text-sm text-muted-foreground">Сводка по итогам недели</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="DollarSign" className="h-5 w-5" />
              Финансовые настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Валюта</Label>
              <Input placeholder="RUB" />
            </div>
            <div className="space-y-2">
              <Label>НДС (%)</Label>
              <Input placeholder="20" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Минимальная предоплата (%)</Label>
              <Input placeholder="30" type="number" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Автоматическая оплата</Label>
                <p className="text-sm text-muted-foreground">Списание при завершении</p>
              </div>
              <Switch />
            </div>
            <Button className="w-full">Сохранить</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" className="h-5 w-5" />
              Безопасность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Текущий пароль</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Новый пароль</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Подтвердите пароль</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Двухфакторная аутентификация</Label>
                <p className="text-sm text-muted-foreground">Дополнительная защита</p>
              </div>
              <Switch />
            </div>
            <Button className="w-full">Изменить пароль</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;

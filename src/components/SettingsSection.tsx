import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { settingsService } from "@/services/settingsService";
import { Settings } from "@/types";

const SettingsSection = () => {
  const [settings, setSettings] = useState<Settings>(settingsService.get());
  const [companyForm, setCompanyForm] = useState({
    companyName: settings.companyName,
    email: settings.email,
    phone: settings.phone,
    address: settings.address
  });
  const [workingHoursForm, setWorkingHoursForm] = useState({
    start: settings.workingHours.start,
    end: settings.workingHours.end
  });
  const [financeForm, setFinanceForm] = useState({
    currency: settings.currency,
    taxRate: settings.taxRate
  });
  const [notificationsForm, setNotificationsForm] = useState({
    email: settings.notifications.email,
    sms: settings.notifications.sms
  });

  const handleSaveCompany = () => {
    const updated = settingsService.update(companyForm);
    setSettings(updated);
    alert("Информация о компании сохранена");
  };

  const handleSaveWorkingHours = () => {
    const updated = settingsService.update({
      workingHours: workingHoursForm
    });
    setSettings(updated);
    alert("Рабочие часы сохранены");
  };

  const handleSaveFinance = () => {
    const updated = settingsService.update(financeForm);
    setSettings(updated);
    alert("Финансовые настройки сохранены");
  };

  const handleSaveNotifications = () => {
    const updated = settingsService.update({
      notifications: notificationsForm
    });
    setSettings(updated);
    alert("Настройки уведомлений сохранены");
  };

  const handleReset = () => {
    if (confirm("Сбросить все настройки к значениям по умолчанию?")) {
      const reset = settingsService.reset();
      setSettings(reset);
      setCompanyForm({
        companyName: reset.companyName,
        email: reset.email,
        phone: reset.phone,
        address: reset.address
      });
      setWorkingHoursForm(reset.workingHours);
      setFinanceForm({
        currency: reset.currency,
        taxRate: reset.taxRate
      });
      setNotificationsForm(reset.notifications);
      alert("Настройки сброшены");
    }
  };

  useEffect(() => {
    const current = settingsService.get();
    setSettings(current);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Настройки</h2>
          <p className="text-muted-foreground">Управление параметрами системы</p>
        </div>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <Icon name="RotateCcw" className="h-4 w-4" />
          Сбросить все
        </Button>
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
              <Input 
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                placeholder="ООО Ремонт Сервис" 
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                placeholder="info@company.ru" 
              />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input 
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                placeholder="+7 (495) 123-45-67" 
              />
            </div>
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input 
                value={companyForm.address}
                onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                placeholder="г. Москва, ул. Примерная, 1" 
              />
            </div>
            <Button onClick={handleSaveCompany} className="w-full">
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Clock" className="h-5 w-5" />
              Рабочие часы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Начало рабочего дня</Label>
              <Input 
                type="time"
                value={workingHoursForm.start}
                onChange={(e) => setWorkingHoursForm({...workingHoursForm, start: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Конец рабочего дня</Label>
              <Input 
                type="time"
                value={workingHoursForm.end}
                onChange={(e) => setWorkingHoursForm({...workingHoursForm, end: e.target.value})}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Текущий график</div>
              <div className="text-lg font-semibold">
                {workingHoursForm.start} - {workingHoursForm.end}
              </div>
            </div>
            <Button onClick={handleSaveWorkingHours} className="w-full">
              Сохранить график
            </Button>
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
              <Switch 
                checked={notificationsForm.email}
                onCheckedChange={(checked) => setNotificationsForm({...notificationsForm, email: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS уведомления</Label>
                <p className="text-sm text-muted-foreground">Уведомления на телефон</p>
              </div>
              <Switch 
                checked={notificationsForm.sms}
                onCheckedChange={(checked) => setNotificationsForm({...notificationsForm, sms: checked})}
              />
            </div>
            <Button onClick={handleSaveNotifications} className="w-full">
              Сохранить настройки
            </Button>
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
              <Input 
                value={financeForm.currency}
                onChange={(e) => setFinanceForm({...financeForm, currency: e.target.value})}
                placeholder="RUB" 
              />
            </div>
            <div className="space-y-2">
              <Label>Ставка налога (%)</Label>
              <Input 
                type="number"
                value={financeForm.taxRate}
                onChange={(e) => setFinanceForm({...financeForm, taxRate: Number(e.target.value)})}
                placeholder="20" 
              />
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Текущая валюта:</span>
                <span className="font-semibold">{financeForm.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ставка налога:</span>
                <span className="font-semibold">{financeForm.taxRate}%</span>
              </div>
            </div>
            <Button onClick={handleSaveFinance} className="w-full">
              Сохранить настройки
            </Button>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" className="h-5 w-5" />
              Информация о системе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Версия системы</span>
                <span className="font-semibold">1.0.0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Последнее обновление</span>
                <span className="font-semibold">{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Валюта по умолчанию</span>
                <span className="font-semibold">{settings.currency}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Налоговая ставка</span>
                <span className="font-semibold">{settings.taxRate}%</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2">
                <Icon name="Download" className="h-4 w-4" />
                Экспорт настроек
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Icon name="Upload" className="h-4 w-4" />
                Импорт настроек
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;

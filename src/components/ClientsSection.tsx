import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const ClientsSection = () => {
  const clients = [
    { id: 1, name: "ООО Техносервис", type: "Юр. лицо", phone: "+7 (495) 123-45-67", email: "info@techservice.ru", orders: 24, total: "₽458,900" },
    { id: 2, name: "ИП Смирнов Петр", type: "ИП", phone: "+7 (495) 234-56-78", email: "smirnov@mail.ru", orders: 12, total: "₽142,300" },
    { id: 3, name: "Иванов Алексей", type: "Физ. лицо", phone: "+7 (903) 345-67-89", email: "ivanov@gmail.com", orders: 5, total: "₽67,500" },
    { id: 4, name: "ООО Компьютеры+", type: "Юр. лицо", phone: "+7 (495) 456-78-90", email: "contact@comp-plus.ru", orders: 18, total: "₽324,700" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Клиенты</h2>
          <p className="text-muted-foreground">База данных клиентов и их заказов</p>
        </div>
        <Button className="gap-2">
          <Icon name="UserPlus" className="h-4 w-4" />
          Добавить клиента
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Input placeholder="Поиск по имени, телефону, email..." className="flex-1" />
            <Button variant="outline" className="gap-2">
              <Icon name="Filter" className="h-4 w-4" />
              Фильтры
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <Badge variant="outline" className="mt-1">{client.type}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Phone" className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Mail" className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-xs text-muted-foreground">Заказов</div>
                      <div className="text-lg font-bold">{client.orders}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Общая сумма</div>
                      <div className="text-lg font-bold">{client.total}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Icon name="Eye" className="h-4 w-4" />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Icon name="Edit" className="h-4 w-4" />
                      Изменить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsSection;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

const RepairsSection = () => {
  const repairs = [
    { id: "49567", device: "Ноутбук ASUS X550", issue: "Не включается", client: "ООО Техносервис", tech: "Иванов А.", status: "В работе", priority: "high", date: "12.10.2025" },
    { id: "49568", device: "ПК Intel i7", issue: "Замена термопасты", client: "ИП Смирнов", tech: "—", status: "Ожидание", priority: "medium", date: "12.10.2025" },
    { id: "49569", device: "MacBook Pro 2020", issue: "Залитие клавиатуры", client: "ООО Компьютеры+", tech: "Петров В.", status: "Диагностика", priority: "low", date: "11.10.2025" },
    { id: "49570", device: "ПК AMD Ryzen", issue: "Замена блока питания", client: "Частное лицо", tech: "Сидоров К.", status: "В работе", priority: "high", date: "11.10.2025" },
    { id: "49571", device: "Ноутбук HP Pavilion", issue: "Чистка от пыли", client: "ИП Козлов", tech: "Иванов А.", status: "Готово", priority: "low", date: "10.10.2025" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Заявки на ремонт</h2>
          <p className="text-muted-foreground">Управление заявками на обслуживание</p>
        </div>
        <Button className="gap-2">
          <Icon name="Plus" className="h-4 w-4" />
          Новая заявка
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Поиск по ID, устройству, клиенту..." className="w-full" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="work">В работе</SelectItem>
                <SelectItem value="wait">Ожидание</SelectItem>
                <SelectItem value="diagnostic">Диагностика</SelectItem>
                <SelectItem value="ready">Готово</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Устройство</th>
                  <th className="p-3 text-left font-medium">Проблема</th>
                  <th className="p-3 text-left font-medium">Клиент</th>
                  <th className="p-3 text-left font-medium">Техник</th>
                  <th className="p-3 text-left font-medium">Статус</th>
                  <th className="p-3 text-left font-medium">Дата</th>
                  <th className="p-3 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((repair) => (
                  <tr key={repair.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">#{repair.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Monitor" className="h-4 w-4 text-muted-foreground" />
                        <span>{repair.device}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{repair.issue}</td>
                    <td className="p-3 text-sm">{repair.client}</td>
                    <td className="p-3 text-sm">{repair.tech}</td>
                    <td className="p-3">
                      <Badge variant={
                        repair.status === 'В работе' ? 'default' :
                        repair.status === 'Готово' ? 'outline' :
                        repair.status === 'Диагностика' ? 'secondary' : 'secondary'
                      }>
                        {repair.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{repair.date}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Icon name="Eye" className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairsSection;

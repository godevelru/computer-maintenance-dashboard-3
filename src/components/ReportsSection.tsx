import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

const ReportsSection = () => {
  const reports = [
    { name: "Отчет по заявкам", description: "Статистика заявок за период", icon: "FileText", type: "Аналитика" },
    { name: "Финансовый отчет", description: "Доходы, расходы, прибыль", icon: "DollarSign", type: "Финансы" },
    { name: "Отчет по техникам", description: "Эффективность сотрудников", icon: "Users", type: "Персонал" },
    { name: "Отчет по складу", description: "Движение товаров и остатки", icon: "Package", type: "Инвентарь" },
    { name: "Отчет по клиентам", description: "База клиентов и их активность", icon: "UserCheck", type: "Клиенты" },
    { name: "Сводный отчет", description: "Общая статистика по всем направлениям", icon: "BarChart3", type: "Общий" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Отчеты</h2>
          <p className="text-muted-foreground">Аналитика и статистика работы сервиса</p>
        </div>
        <Button className="gap-2">
          <Icon name="Plus" className="h-4 w-4" />
          Создать отчет
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Отчетов создано</CardTitle>
            <Icon name="FileText" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">147</div>
            <p className="text-xs text-muted-foreground mt-1">За последний месяц</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Экспортировано</CardTitle>
            <Icon name="Download" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89</div>
            <p className="text-xs text-muted-foreground mt-1">PDF и Excel файлов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Запланировано</CardTitle>
            <Icon name="Calendar" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Автоматических отчетов</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Шаблоны отчетов</CardTitle>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="finance">Финансы</SelectItem>
                  <SelectItem value="analytics">Аналитика</SelectItem>
                  <SelectItem value="staff">Персонал</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={report.icon} className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{report.name}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {report.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Icon name="Eye" className="h-4 w-4" />
                          Просмотр
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Icon name="Download" className="h-4 w-4" />
                          Экспорт
                        </Button>
                      </div>
                    </div>
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

export default ReportsSection;

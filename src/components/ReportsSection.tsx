import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ReportBuilder, type ReportConfig, type ReportField } from './ReportBuilder';
import { ImportExportDialog } from './ImportExportDialog';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const sampleReportTemplates = [
  {
    id: 'requests-monthly',
    name: 'Заявки за месяц',
    description: 'Статистика заявок по статусам за текущий месяц',
    icon: 'FileText',
    category: 'Заявки',
  },
  {
    id: 'revenue-analysis',
    name: 'Анализ доходов',
    description: 'Детальный отчет по доходам и расходам',
    icon: 'TrendingUp',
    category: 'Финансы',
  },
  {
    id: 'inventory-status',
    name: 'Состояние инвентаря',
    description: 'Остатки деталей и компонентов',
    icon: 'Package',
    category: 'Инвентарь',
  },
  {
    id: 'tech-performance',
    name: 'Эффективность техников',
    description: 'Производительность сотрудников',
    icon: 'Users',
    category: 'Техники',
  },
  {
    id: 'client-activity',
    name: 'Активность клиентов',
    description: 'Частота обращений и средний чек',
    icon: 'UserCheck',
    category: 'Клиенты',
  },
  {
    id: 'service-types',
    name: 'Типы услуг',
    description: 'Распределение заявок по типам ремонта',
    icon: 'PieChart',
    category: 'Аналитика',
  },
];

const requestsData = [
  { month: 'Янв', completed: 65, inProgress: 28, waiting: 12 },
  { month: 'Фев', completed: 72, inProgress: 24, waiting: 15 },
  { month: 'Мар', completed: 81, inProgress: 31, waiting: 9 },
  { month: 'Апр', completed: 78, inProgress: 26, waiting: 14 },
  { month: 'Май', completed: 88, inProgress: 29, waiting: 11 },
  { month: 'Июн', completed: 95, inProgress: 32, waiting: 8 },
];

const revenueData = [
  { month: 'Янв', revenue: 245000, expenses: 120000 },
  { month: 'Фев', revenue: 268000, expenses: 135000 },
  { month: 'Мар', revenue: 302000, expenses: 145000 },
  { month: 'Апр', revenue: 289000, expenses: 138000 },
  { month: 'Май', revenue: 325000, expenses: 152000 },
  { month: 'Июн', revenue: 358000, expenses: 165000 },
];

const serviceTypesData = [
  { name: 'Диагностика', value: 156 },
  { name: 'Ремонт ПК', value: 243 },
  { name: 'Ремонт ноутбуков', value: 198 },
  { name: 'Замена комплектующих', value: 167 },
  { name: 'Установка ПО', value: 89 },
  { name: 'Прочее', value: 47 },
];

const availableFields: ReportField[] = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'client', label: 'Клиент', type: 'string' },
  { key: 'status', label: 'Статус', type: 'string' },
  { key: 'priority', label: 'Приоритет', type: 'string' },
  { key: 'techician', label: 'Техник', type: 'string' },
  { key: 'amount', label: 'Сумма', type: 'number' },
  { key: 'createdAt', label: 'Дата создания', type: 'date' },
  { key: 'completedAt', label: 'Дата завершения', type: 'date' },
];

const ReportsSection = () => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);

  const handleSaveReport = (config: ReportConfig) => {
    setSavedReports([...savedReports, config]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Отчеты</h2>
          <p className="text-muted-foreground">
            Аналитика и отчеты по всем разделам системы
          </p>
        </div>
        <Button onClick={() => setBuilderOpen(true)}>
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Создать отчет
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего отчетов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sampleReportTemplates.length + savedReports.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Пользовательских
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{savedReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Шаблонов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sampleReportTemplates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Экспортов сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Динамика заявок</CardTitle>
                <CardDescription>Статистика за последние 6 месяцев</CardDescription>
              </div>
              <ImportExportDialog
                data={requestsData}
                filename="requests-dynamics"
                title="Динамика заявок"
                trigger={
                  <Button size="sm" variant="ghost">
                    <Icon name="Download" className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Завершено" />
                <Bar dataKey="inProgress" fill="#3b82f6" name="В работе" />
                <Bar dataKey="waiting" fill="#f59e0b" name="Ожидание" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Доходы и расходы</CardTitle>
                <CardDescription>Финансовая динамика за полугодие</CardDescription>
              </div>
              <ImportExportDialog
                data={revenueData}
                filename="revenue-analysis"
                title="Доходы и расходы"
                trigger={
                  <Button size="sm" variant="ghost">
                    <Icon name="Download" className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Доходы"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Расходы"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Распределение по типам услуг</CardTitle>
              <CardDescription>Популярность различных видов ремонта</CardDescription>
            </div>
            <ImportExportDialog
              data={serviceTypesData}
              filename="service-types"
              title="Типы услуг"
              trigger={
                <Button size="sm" variant="ghost">
                  <Icon name="Download" className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={serviceTypesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Шаблоны отчетов</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleReportTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Icon name={template.icon as any} className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Icon name="Play" className="h-4 w-4 mr-2" />
                    Открыть
                  </Button>
                  <ImportExportDialog
                    data={[]}
                    filename={template.id}
                    title={template.name}
                    trigger={
                      <Button size="sm" variant="outline">
                        <Icon name="Download" className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {savedReports.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Пользовательские отчеты</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedReports.map((report, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                      <Icon name="FileText" className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge>Пользовательский</Badge>
                  </div>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <CardDescription className="text-sm">{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Columns" className="h-4 w-4 mr-2" />
                      Полей: {report.fields.length}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Filter" className="h-4 w-4 mr-2" />
                      Фильтров: {report.filters.length}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Icon name="Play" className="h-4 w-4 mr-2" />
                      Выполнить
                    </Button>
                    <Button size="sm" variant="outline">
                      <Icon name="Settings" className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ReportBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        availableFields={availableFields}
        onSave={handleSaveReport}
      />
    </div>
  );
};

export default ReportsSection;

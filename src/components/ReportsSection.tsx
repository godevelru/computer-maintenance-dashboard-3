/**
 * ReportsSection - Полнофункциональный раздел отчетов
 * 
 * Возможности:
 * 1. Шаблоны отчетов (6 готовых шаблонов):
 *    - Заявки за месяц
 *    - Анализ доходов
 *    - Состояние инвентаря
 *    - Эффективность техников
 *    - Активность клиентов
 *    - Типы услуг
 * 
 * 2. Пользовательские отчеты:
 *    - Создание через визуальный конструктор
 *    - Выбор полей для отображения
 *    - Фильтрация данных (equals, contains, greater, less)
 *    - Сортировка и группировка
 *    - Редактирование существующих отчетов
 *    - Дублирование отчетов
 *    - Удаление отчетов
 * 
 * 3. Просмотр и экспорт:
 *    - Открытие отчета в полноэкранном диалоге
 *    - Таблица с поиском и сортировкой
 *    - Экспорт в Excel, CSV, JSON, XML, PDF
 *    - Статистика по отчету
 * 
 * 4. Графики и аналитика:
 *    - Динамика заявок (столбчатая диаграмма)
 *    - Доходы и расходы (линейная диаграмма)
 *    - Распределение по типам услуг (круговая диаграмма)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ReportBuilder, type ReportConfig, type ReportField } from './ReportBuilder';
import { ImportExportDialog } from './ImportExportDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DataTable, Column } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { repairService } from '@/services/repairService';
import { clientService } from '@/services/clientService';
import { technicianService } from '@/services/technicianService';
import { inventoryService } from '@/services/inventoryService';
import { financeService } from '@/services/financeService';
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

interface TemplateReport {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const ReportsSection = () => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [savedReports, setSavedReports] = useState<ReportConfig[]>(() => {
    const saved = localStorage.getItem('savedReports');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewingTemplate, setViewingTemplate] = useState<TemplateReport | null>(null);
  const [viewingCustomReport, setViewingCustomReport] = useState<ReportConfig | null>(null);
  const [templateData, setTemplateData] = useState<any[]>([]);
  const [customReportData, setCustomReportData] = useState<any[]>([]);
  const [editingReportIndex, setEditingReportIndex] = useState<number | null>(null);

  useEffect(() => {
    if (savedReports.length > 0) {
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
    }
  }, [savedReports]);

  const handleSaveReport = (config: ReportConfig) => {
    if (editingReportIndex !== null) {
      const newReports = [...savedReports];
      newReports[editingReportIndex] = config;
      setSavedReports(newReports);
      setEditingReportIndex(null);
      toast.success('Отчет обновлен и сохранен автоматически');
    } else {
      setSavedReports([...savedReports, config]);
      toast.success('Отчет сохранен и будет доступен после перезагрузки');
    }
  };

  const handleDeleteReport = (index: number) => {
    const newReports = savedReports.filter((_, i) => i !== index);
    setSavedReports(newReports);
    toast.success('Отчет удален');
  };

  const handleEditReport = (index: number) => {
    setEditingReportIndex(index);
    setBuilderOpen(true);
  };

  const handleDuplicateReport = (report: ReportConfig) => {
    const duplicated = {
      ...report,
      name: `${report.name} (копия)`,
    };
    setSavedReports([...savedReports, duplicated]);
    toast.success('Отчет скопирован');
  };

  const generateTemplateData = (templateId: string) => {
    const repairs = repairService.getAll();
    const clients = clientService.getAll();
    const technicians = technicianService.getAll();
    const inventory = inventoryService.getAll();
    const transactions = financeService.getAll();

    switch (templateId) {
      case 'requests-monthly': {
        const now = new Date();
        const currentMonth = now.getMonth();
        const monthlyRepairs = repairs.filter(r => {
          const repairDate = new Date(r.createdAt);
          return repairDate.getMonth() === currentMonth;
        });
        return monthlyRepairs.map(r => ({
          id: r.id,
          clientName: r.clientName,
          deviceModel: r.deviceModel,
          status: r.status,
          priority: r.priority,
          estimatedCost: r.estimatedCost,
          technicianName: r.technicianName || 'Не назначен',
          createdAt: new Date(r.createdAt).toLocaleDateString('ru-RU'),
        }));
      }
      case 'revenue-analysis': {
        return transactions.map(t => ({
          id: t.id,
          date: new Date(t.date).toLocaleDateString('ru-RU'),
          type: t.type === 'income' ? 'Доход' : 'Расход',
          category: t.category,
          description: t.description,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
        }));
      }
      case 'inventory-status': {
        return inventory.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          sku: item.sku,
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          status: item.quantity <= item.minQuantity ? 'Требуется заказ' : 'В наличии',
          price: item.price,
          supplier: item.supplier,
        }));
      }
      case 'tech-performance': {
        return technicians.map(tech => {
          const techRepairs = repairs.filter(r => r.technicianId === tech.id);
          const completed = techRepairs.filter(r => r.status === 'completed').length;
          const revenue = techRepairs
            .filter(r => r.finalCost)
            .reduce((sum, r) => sum + (r.finalCost || 0), 0);
          return {
            id: tech.id,
            name: tech.name,
            specialization: tech.specialization,
            rating: tech.rating,
            completedJobs: completed,
            totalJobs: techRepairs.length,
            revenue: revenue,
            hourlyRate: tech.hourlyRate,
          };
        });
      }
      case 'client-activity': {
        return clients.map(client => {
          const clientRepairs = repairs.filter(r => r.clientId === client.id);
          const avgCost = clientRepairs.length > 0
            ? clientRepairs.reduce((sum, r) => sum + (r.finalCost || r.estimatedCost), 0) / clientRepairs.length
            : 0;
          return {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            totalOrders: client.totalOrders,
            totalSpent: client.totalSpent,
            avgOrderValue: avgCost,
            lastOrder: clientRepairs.length > 0
              ? new Date(Math.max(...clientRepairs.map(r => new Date(r.createdAt).getTime()))).toLocaleDateString('ru-RU')
              : 'Нет заказов',
          };
        });
      }
      case 'service-types': {
        const typeCount: Record<string, number> = {};
        repairs.forEach(r => {
          const type = r.deviceType || 'Прочее';
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        return Object.entries(typeCount).map(([type, count]) => ({
          type,
          count,
          percentage: ((count / repairs.length) * 100).toFixed(1) + '%',
        }));
      }
      default:
        return [];
    }
  };

  const getTemplateColumns = (templateId: string): Column<any>[] => {
    switch (templateId) {
      case 'requests-monthly':
        return [
          { header: 'ID', accessorKey: 'id' },
          { header: 'Клиент', accessorKey: 'clientName' },
          { header: 'Устройство', accessorKey: 'deviceModel' },
          { header: 'Статус', accessorKey: 'status' },
          { header: 'Приоритет', accessorKey: 'priority' },
          { header: 'Стоимость', accessorKey: 'estimatedCost' },
          { header: 'Техник', accessorKey: 'technicianName' },
          { header: 'Дата', accessorKey: 'createdAt' },
        ];
      case 'revenue-analysis':
        return [
          { header: 'ID', accessorKey: 'id' },
          { header: 'Дата', accessorKey: 'date' },
          { header: 'Тип', accessorKey: 'type' },
          { header: 'Категория', accessorKey: 'category' },
          { header: 'Описание', accessorKey: 'description' },
          { header: 'Сумма', accessorKey: 'amount' },
          { header: 'Способ оплаты', accessorKey: 'paymentMethod' },
        ];
      case 'inventory-status':
        return [
          { header: 'ID', accessorKey: 'id' },
          { header: 'Наименование', accessorKey: 'name' },
          { header: 'Категория', accessorKey: 'category' },
          { header: 'SKU', accessorKey: 'sku' },
          { header: 'Количество', accessorKey: 'quantity' },
          { header: 'Мин. остаток', accessorKey: 'minQuantity' },
          { header: 'Статус', accessorKey: 'status' },
          { header: 'Цена', accessorKey: 'price' },
        ];
      case 'tech-performance':
        return [
          { header: 'ID', accessorKey: 'id' },
          { header: 'Имя', accessorKey: 'name' },
          { header: 'Специализация', accessorKey: 'specialization' },
          { header: 'Рейтинг', accessorKey: 'rating' },
          { header: 'Завершено', accessorKey: 'completedJobs' },
          { header: 'Всего заказов', accessorKey: 'totalJobs' },
          { header: 'Выручка', accessorKey: 'revenue' },
          { header: 'Ставка/час', accessorKey: 'hourlyRate' },
        ];
      case 'client-activity':
        return [
          { header: 'ID', accessorKey: 'id' },
          { header: 'Имя', accessorKey: 'name' },
          { header: 'Email', accessorKey: 'email' },
          { header: 'Телефон', accessorKey: 'phone' },
          { header: 'Заказов', accessorKey: 'totalOrders' },
          { header: 'Потрачено', accessorKey: 'totalSpent' },
          { header: 'Средний чек', accessorKey: 'avgOrderValue' },
          { header: 'Последний заказ', accessorKey: 'lastOrder' },
        ];
      case 'service-types':
        return [
          { header: 'Тип услуги', accessorKey: 'type' },
          { header: 'Количество', accessorKey: 'count' },
          { header: 'Процент', accessorKey: 'percentage' },
        ];
      default:
        return [];
    }
  };

  const handleOpenTemplate = (template: TemplateReport) => {
    const data = generateTemplateData(template.id);
    setTemplateData(data);
    setViewingTemplate(template);
  };

  const executeCustomReport = (report: ReportConfig) => {
    const repairs = repairService.getAll();
    let data = repairs.map(r => ({
      id: r.id,
      client: r.clientName,
      status: r.status,
      priority: r.priority,
      techician: r.technicianName || 'Не назначен',
      amount: r.finalCost || r.estimatedCost,
      createdAt: new Date(r.createdAt).toLocaleDateString('ru-RU'),
      completedAt: r.completedAt ? new Date(r.completedAt).toLocaleDateString('ru-RU') : 'Не завершено',
    }));

    report.filters.forEach(filter => {
      data = data.filter(item => {
        const value = item[filter.field as keyof typeof item];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'equals':
            return value === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'greater':
            return Number(value) > Number(filterValue);
          case 'less':
            return Number(value) < Number(filterValue);
          case 'between':
            return true;
          default:
            return true;
        }
      });
    });

    if (report.sortBy) {
      data.sort((a, b) => {
        const aVal = a[report.sortBy as keyof typeof a];
        const bVal = b[report.sortBy as keyof typeof b];
        if (aVal < bVal) return report.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return report.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const filteredData = data.map(item => {
      const result: any = {};
      report.fields.forEach(field => {
        result[field] = item[field as keyof typeof item];
      });
      return result;
    });

    setCustomReportData(filteredData);
    setViewingCustomReport(report);
    toast.success(`Отчет выполнен: найдено ${filteredData.length} записей`);
  };

  const getCustomReportColumns = (report: ReportConfig): Column<any>[] => {
    return report.fields.map(field => {
      const fieldConfig = availableFields.find(f => f.key === field);
      return {
        header: fieldConfig?.label || field,
        accessorKey: field,
      };
    });
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
        <Button onClick={() => { setEditingReportIndex(null); setBuilderOpen(true); }}>
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
                  <Button size="sm" className="flex-1" onClick={() => handleOpenTemplate(template)}>
                    <Icon name="Play" className="h-4 w-4 mr-2" />
                    Открыть
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const data = generateTemplateData(template.id);
                      toast.success(`Данные подготовлены для экспорта: ${data.length} записей`);
                    }}
                  >
                    <Icon name="Download" className="h-4 w-4" />
                  </Button>
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
                  <div className="space-y-2">
                    <Button size="sm" className="w-full" onClick={() => executeCustomReport(report)}>
                      <Icon name="Play" className="h-4 w-4 mr-2" />
                      Выполнить
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditReport(index)}
                        title="Редактировать отчет"
                      >
                        <Icon name="Settings" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDuplicateReport(report)}
                        title="Дублировать отчет"
                      >
                        <Icon name="Copy" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDeleteReport(index)}
                        title="Удалить отчет"
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ReportBuilder
        open={builderOpen}
        onOpenChange={(open) => {
          setBuilderOpen(open);
          if (!open) setEditingReportIndex(null);
        }}
        availableFields={availableFields}
        onSave={handleSaveReport}
        initialConfig={editingReportIndex !== null ? savedReports[editingReportIndex] : undefined}
      />

      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Icon name={viewingTemplate?.icon as any} className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>{viewingTemplate?.name}</DialogTitle>
                <DialogDescription>{viewingTemplate?.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {viewingTemplate && templateData.length > 0 ? (
              <>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Записей найдено:</span>
                      <span className="ml-2 font-semibold text-lg">{templateData.length}</span>
                    </div>
                    <Badge variant="outline">{viewingTemplate.category}</Badge>
                  </div>
                </div>
                <DataTable
                  data={templateData}
                  columns={getTemplateColumns(viewingTemplate.id)}
                  searchKeys={Object.keys(templateData[0] || {})}
                  searchPlaceholder="Поиск..."
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Icon name="FileX" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Нет данных для отображения</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <ImportExportDialog
              data={templateData}
              filename={viewingTemplate?.id || 'report'}
              title={viewingTemplate?.name || 'Отчет'}
              trigger={
                <Button variant="outline">
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Экспортировать
                </Button>
              }
            />
            <Button onClick={() => setViewingTemplate(null)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCustomReport} onOpenChange={() => setViewingCustomReport(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                <Icon name="FileText" className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle>{viewingCustomReport?.name}</DialogTitle>
                <DialogDescription>{viewingCustomReport?.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {viewingCustomReport && customReportData.length > 0 ? (
              <>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Полей:</span>
                      <span className="ml-2 font-semibold">{viewingCustomReport.fields.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Фильтров:</span>
                      <span className="ml-2 font-semibold">{viewingCustomReport.filters.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Записей:</span>
                      <span className="ml-2 font-semibold">{customReportData.length}</span>
                    </div>
                  </div>
                </div>
                <DataTable
                  data={customReportData}
                  columns={getCustomReportColumns(viewingCustomReport)}
                  searchKeys={viewingCustomReport.fields}
                  searchPlaceholder="Поиск..."
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Icon name="FileX" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Нет данных для отображения</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <ImportExportDialog
              data={customReportData}
              filename={viewingCustomReport?.name.toLowerCase().replace(/\s+/g, '-') || 'custom-report'}
              title={viewingCustomReport?.name || 'Отчет'}
              trigger={
                <Button variant="outline">
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Экспортировать
                </Button>
              }
            />
            <Button onClick={() => setViewingCustomReport(null)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsSection;
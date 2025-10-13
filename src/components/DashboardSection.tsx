import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { repairService } from "@/services/repairService";
import { clientService } from "@/services/clientService";
import { technicianService } from "@/services/technicianService";
import { inventoryService } from "@/services/inventoryService";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  iconBg?: string;
  iconColor?: string;
}

const StatCard = ({ title, value, icon, trend, trendUp, iconBg = "bg-gradient-to-br from-primary/20 to-primary/5", iconColor = "text-primary" }: StatCardProps) => (
  <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-0">
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon name={icon} className={`h-6 w-6 ${iconColor}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {trend && (
        <p className={`text-xs flex items-center gap-1.5 font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          <Icon name={trendUp ? "TrendingUp" : "TrendingDown"} className="h-3.5 w-3.5" />
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

const DashboardSection = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const repairs = repairService.getAll();
  const clients = clientService.getAll();
  const technicians = technicianService.getAll();
  const inventory = inventoryService.getAll();

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const getDateFilter = () => {
      switch(timeRange) {
        case 'today': return todayStart;
        case 'week': return weekStart;
        case 'month': return monthStart;
      }
    };

    const filterDate = getDateFilter();
    const filteredRepairs = repairs.filter(r => new Date(r.createdAt) >= filterDate);

    const activeRepairs = repairs.filter(r => 
      r.status === 'new' || r.status === 'in_progress' || r.status === 'waiting_parts'
    ).length;

    const completedToday = filteredRepairs.filter(r => r.status === 'completed').length;
    const completedLastPeriod = repairs.filter(r => {
      const date = new Date(r.createdAt);
      const prevPeriodStart = new Date(filterDate.getTime() - (now.getTime() - filterDate.getTime()));
      return date >= prevPeriodStart && date < filterDate && r.status === 'completed';
    }).length;
    
    const completedTrend = completedLastPeriod > 0 
      ? `${Math.round(((completedToday - completedLastPeriod) / completedLastPeriod) * 100)}%`
      : '+100%';

    const revenue = filteredRepairs
      .filter(r => r.status === 'completed' && r.finalCost)
      .reduce((sum, r) => sum + (r.finalCost || 0), 0);

    const prevRevenue = repairs.filter(r => {
      const date = new Date(r.createdAt);
      const prevPeriodStart = new Date(filterDate.getTime() - (now.getTime() - filterDate.getTime()));
      return date >= prevPeriodStart && date < filterDate && r.status === 'completed' && r.finalCost;
    }).reduce((sum, r) => sum + (r.finalCost || 0), 0);

    const revenueTrend = prevRevenue > 0 
      ? `${Math.round(((revenue - prevRevenue) / prevRevenue) * 100)}%`
      : '+100%';

    const onDutyTechs = technicians.filter(t => 
      t.status === 'available' || t.status === 'busy'
    ).length;

    const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity).length;

    const urgentRepairs = repairs.filter(r => 
      r.priority === 'urgent' && (r.status === 'new' || r.status === 'in_progress')
    ).length;

    const avgRepairTime = completedToday > 0 
      ? Math.round(filteredRepairs
          .filter(r => r.status === 'completed' && r.completedAt)
          .reduce((sum, r) => {
            const created = new Date(r.createdAt).getTime();
            const completed = new Date(r.completedAt!).getTime();
            return sum + (completed - created);
          }, 0) / completedToday / (1000 * 60 * 60))
      : 0;

    return {
      activeRepairs,
      completedToday,
      completedTrend,
      completedTrendUp: completedToday >= completedLastPeriod,
      revenue,
      revenueTrend,
      revenueTrendUp: revenue >= prevRevenue,
      onDutyTechs,
      lowStockItems,
      urgentRepairs,
      avgRepairTime,
      totalClients: clients.length,
      newClients: clients.filter(c => {
        const createdDate = new Date(c.createdAt || 0);
        return createdDate >= filterDate;
      }).length
    };
  }, [repairs, clients, technicians, inventory, timeRange]);

  const recentRepairs = repairs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const statusDistribution = [
    { label: "В работе", value: repairs.filter(r => r.status === 'in_progress').length, color: "bg-blue-500" },
    { label: "Ожидание деталей", value: repairs.filter(r => r.status === 'waiting_parts').length, color: "bg-yellow-500" },
    { label: "Новые", value: repairs.filter(r => r.status === 'new').length, color: "bg-purple-500" },
    { label: "Завершено", value: repairs.filter(r => r.status === 'completed').length, color: "bg-green-500" },
  ];

  const topTechnicians = technicians
    .sort((a, b) => b.completedRepairs - a.completedRepairs)
    .slice(0, 5);

  const priorityBreakdown = [
    { label: "Срочные", count: repairs.filter(r => r.priority === 'urgent' && r.status !== 'completed').length, color: "text-red-600", icon: "AlertCircle" },
    { label: "Высокий", count: repairs.filter(r => r.priority === 'high' && r.status !== 'completed').length, color: "text-orange-600", icon: "ArrowUp" },
    { label: "Средний", count: repairs.filter(r => r.priority === 'medium' && r.status !== 'completed').length, color: "text-blue-600", icon: "Minus" },
    { label: "Низкий", count: repairs.filter(r => r.priority === 'low' && r.status !== 'completed').length, color: "text-gray-600", icon: "ArrowDown" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: any = {
      new: { variant: "secondary", label: "Новая" },
      in_progress: { variant: "default", label: "В работе" },
      waiting_parts: { variant: "outline", label: "Ожидание" },
      completed: { variant: "outline", label: "Завершено" },
      cancelled: { variant: "destructive", label: "Отменено" }
    };
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      urgent: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-blue-600 bg-blue-50',
      low: 'text-gray-600 bg-gray-50'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
          <p className="text-muted-foreground">Полный обзор системы управления ремонтом</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="today">Сегодня</TabsTrigger>
            <TabsTrigger value="week">Неделя</TabsTrigger>
            <TabsTrigger value="month">Месяц</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Активные заявки" 
          value={stats.activeRepairs} 
          icon="Wrench" 
          iconBg="bg-gradient-to-br from-blue-500/20 to-blue-500/5"
          iconColor="text-blue-600"
        />
        <StatCard 
          title={`Завершено (${timeRange === 'today' ? 'сегодня' : timeRange === 'week' ? 'неделя' : 'месяц'})`}
          value={stats.completedToday} 
          icon="CheckCircle2" 
          trend={stats.completedTrend}
          trendUp={stats.completedTrendUp}
          iconBg="bg-gradient-to-br from-green-500/20 to-green-500/5"
          iconColor="text-green-600"
        />
        <StatCard 
          title={`Доход (${timeRange === 'today' ? 'сегодня' : timeRange === 'week' ? 'неделя' : 'месяц'})`}
          value={`₽${stats.revenue.toLocaleString()}`}
          icon="DollarSign" 
          trend={stats.revenueTrend}
          trendUp={stats.revenueTrendUp}
          iconBg="bg-gradient-to-br from-purple-500/20 to-purple-500/5"
          iconColor="text-purple-600"
        />
        <StatCard 
          title="Техников на смене" 
          value={stats.onDutyTechs}
          icon="Users" 
          iconBg="bg-gradient-to-br from-orange-500/20 to-orange-500/5"
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Срочные заявки</div>
                <div className="text-2xl font-bold text-red-600">{stats.urgentRepairs}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="AlertCircle" className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Низкий остаток</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon name="AlertTriangle" className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Ср. время ремонта</div>
                <div className="text-2xl font-bold">{stats.avgRepairTime}ч</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Icon name="Clock" className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Новых клиентов</div>
                <div className="text-2xl font-bold">{stats.newClients}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="UserPlus" className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Последние заявки</CardTitle>
            <CardDescription>Актуальные заявки на ремонт</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRepairs.map((repair) => (
                <div key={repair.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getPriorityColor(repair.priority)}`}>
                      <Icon name="Monitor" className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{repair.id}</span>
                        {repair.priority === 'urgent' && (
                          <Icon name="Zap" className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{repair.deviceModel} • {repair.clientName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(repair.status)}
                    <div className="text-sm text-muted-foreground w-24 text-right truncate">
                      {repair.technicianName || '—'}
                    </div>
                    <Button size="sm" variant="ghost">
                      <Icon name="Eye" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>По статусам</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusDistribution.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-medium">{stat.value}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.color} transition-all duration-500`}
                      style={{ width: `${Math.min((stat.value / repairs.length) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>По приоритетам</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityBreakdown.map((priority) => (
                <div key={priority.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={priority.icon} className={`h-4 w-4 ${priority.color}`} />
                    <span className="text-sm">{priority.label}</span>
                  </div>
                  <Badge variant="outline" className={priority.color}>{priority.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Топ техников</CardTitle>
          <CardDescription>Рейтинг по выполненным заявкам</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTechnicians.map((tech, index) => (
              <div key={tech.id} className="flex items-center gap-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                  {tech.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tech.name}</div>
                  <div className="text-sm text-muted-foreground">{tech.specialization.join(', ')}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{tech.completedRepairs} заявок</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                      <Icon name="Star" className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {tech.rating.toFixed(1)}
                    </div>
                  </div>
                  <Badge variant={tech.status === 'available' ? 'outline' : 'default'}>
                    {tech.status === 'available' ? 'Свободен' : tech.status === 'busy' ? 'Занят' : 'Не на смене'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSection;

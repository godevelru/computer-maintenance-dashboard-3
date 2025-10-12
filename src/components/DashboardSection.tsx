import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => (
  <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-0">
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Icon name={icon} className="h-6 w-6 text-primary" />
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
        <p className="text-muted-foreground">Обзор системы управления ремонтом компьютеров</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Активные заявки" 
          value={24} 
          icon="Wrench" 
          trend="+12% за неделю"
          trendUp={true}
        />
        <StatCard 
          title="Завершено сегодня" 
          value={8} 
          icon="CheckCircle2" 
          trend="+5% от плана"
          trendUp={true}
        />
        <StatCard 
          title="Доход за месяц" 
          value="₽285,400" 
          icon="DollarSign" 
          trend="+18% к прошлому"
          trendUp={true}
        />
        <StatCard 
          title="Техников на смене" 
          value={6} 
          icon="Users" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Последние заявки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "49567", client: "ООО Техносервис", status: "В работе", tech: "Иванов А.", priority: "high" },
                { id: "49568", client: "ИП Смирнов", status: "Ожидание", tech: "—", priority: "medium" },
                { id: "49569", client: "ООО Компьютеры+", status: "Диагностика", tech: "Петров В.", priority: "low" },
                { id: "49570", client: "Частное лицо", status: "В работе", tech: "Сидоров К.", priority: "high" },
              ].map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Icon name="Monitor" className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">#{ticket.id}</div>
                      <div className="text-sm text-muted-foreground">{ticket.client}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}>
                      {ticket.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground w-24">{ticket.tech}</div>
                    <Button size="sm" variant="ghost">
                      <Icon name="Eye" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика по статусам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "В работе", value: 12, color: "bg-blue-500" },
              { label: "Ожидание деталей", value: 5, color: "bg-yellow-500" },
              { label: "Диагностика", value: 4, color: "bg-purple-500" },
              { label: "Готово к выдаче", value: 3, color: "bg-green-500" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color}`} style={{ width: `${(stat.value / 24) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSection;
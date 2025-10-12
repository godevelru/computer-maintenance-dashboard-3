import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const SupportSection = () => {
  const tickets = [
    { id: 1, subject: "Ошибка при создании заявки", status: "open", priority: "high", date: "12.10.2025", replies: 3 },
    { id: 2, subject: "Вопрос по экспорту отчетов", status: "in-progress", priority: "medium", date: "11.10.2025", replies: 5 },
    { id: 3, subject: "Запрос на новую функцию", status: "closed", priority: "low", date: "09.10.2025", replies: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Поддержка</h2>
          <p className="text-muted-foreground">Техническая поддержка и помощь</p>
        </div>
        <Button className="gap-2">
          <Icon name="Plus" className="h-4 w-4" />
          Новое обращение
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Открытых тикетов</CardTitle>
            <Icon name="MessageSquare" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Требуют внимания</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Icon name="Clock" className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Ожидают ответа</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Решено сегодня</CardTitle>
            <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Средний срок 2ч</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Рейтинг поддержки</CardTitle>
            <Icon name="Star" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground mt-1">Средняя оценка</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Мои обращения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Icon name="MessageSquare" className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">#{ticket.id} {ticket.subject}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{ticket.date}</span>
                        <span>•</span>
                        <span>{ticket.replies} ответов</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      ticket.priority === 'high' ? 'destructive' :
                      ticket.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {ticket.priority === 'high' ? 'Высокий' :
                       ticket.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                    <Badge variant={
                      ticket.status === 'open' ? 'default' :
                      ticket.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {ticket.status === 'open' ? 'Открыт' :
                       ticket.status === 'in-progress' ? 'В работе' : 'Закрыт'}
                    </Badge>
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
            <CardTitle>Создать обращение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тема</Label>
              <Input placeholder="Опишите проблему кратко" />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea placeholder="Подробное описание проблемы..." rows={6} />
            </div>
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <select className="w-full p-2 border rounded-md">
                <option>Низкий</option>
                <option>Средний</option>
                <option>Высокий</option>
              </select>
            </div>
            <Button className="w-full gap-2">
              <Icon name="Send" className="h-4 w-4" />
              Отправить
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" className="h-5 w-5" />
            База знаний
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Как создать заявку", category: "Инструкции", icon: "FileText" },
              { title: "Работа с клиентами", category: "Руководство", icon: "Users" },
              { title: "Настройка уведомлений", category: "Настройки", icon: "Bell" },
              { title: "Экспорт отчетов", category: "Отчеты", icon: "Download" },
              { title: "Управление складом", category: "Инвентарь", icon: "Package" },
              { title: "Финансовые операции", category: "Финансы", icon: "DollarSign" },
            ].map((article, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={article.icon} className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{article.title}</h4>
                      <p className="text-xs text-muted-foreground">{article.category}</p>
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

export default SupportSection;

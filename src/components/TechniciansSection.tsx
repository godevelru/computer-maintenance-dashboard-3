import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

const TechniciansSection = () => {
  const technicians = [
    { id: 1, name: "Иванов Алексей", specialty: "Ноутбуки", status: "active", tasks: 5, completed: 48, rating: 4.8, avatar: "A" },
    { id: 2, name: "Петров Владимир", specialty: "ПК", status: "active", tasks: 3, completed: 62, rating: 4.9, avatar: "П" },
    { id: 3, name: "Сидоров Константин", specialty: "Apple техника", status: "active", tasks: 4, completed: 35, rating: 4.7, avatar: "С" },
    { id: 4, name: "Козлов Дмитрий", specialty: "Периферия", status: "offline", tasks: 0, completed: 28, rating: 4.5, avatar: "К" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Техники</h2>
          <p className="text-muted-foreground">Управление сотрудниками и распределение задач</p>
        </div>
        <Button className="gap-2">
          <Icon name="UserPlus" className="h-4 w-4" />
          Добавить техника
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Icon name="UserCheck" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-xs text-muted-foreground">На смене</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icon name="Wrench" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs text-muted-foreground">В работе</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Icon name="CheckCircle2" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">173</div>
                <div className="text-xs text-muted-foreground">За месяц</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Icon name="Star" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">4.7</div>
                <div className="text-xs text-muted-foreground">Средний рейтинг</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Input placeholder="Поиск по имени, специализации..." />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {technicians.map((tech) => (
              <Card key={tech.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                        {tech.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tech.name}</h3>
                        <p className="text-sm text-muted-foreground">{tech.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Icon name="Star" className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{tech.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={tech.status === 'active' ? 'default' : 'secondary'}>
                      {tech.status === 'active' ? 'На смене' : 'Не на смене'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Текущие задачи</span>
                      <span className="font-medium">{tech.tasks}</span>
                    </div>
                    <Progress value={(tech.tasks / 10) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm pt-2">
                      <div className="flex items-center gap-2">
                        <Icon name="CheckCircle2" className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Выполнено</span>
                      </div>
                      <span className="font-medium">{tech.completed} заявок</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Icon name="Eye" className="h-4 w-4" />
                      Профиль
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Icon name="Calendar" className="h-4 w-4" />
                      График
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

export default TechniciansSection;

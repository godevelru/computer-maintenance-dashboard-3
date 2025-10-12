import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const ScheduleSection = () => {
  const schedule = [
    { day: "Понедельник", date: "14.10", shifts: [
      { tech: "Иванов А.", time: "09:00 - 18:00", status: "confirmed" },
      { tech: "Петров В.", time: "12:00 - 21:00", status: "confirmed" },
      { tech: "Сидоров К.", time: "09:00 - 18:00", status: "confirmed" },
    ]},
    { day: "Вторник", date: "15.10", shifts: [
      { tech: "Иванов А.", time: "09:00 - 18:00", status: "confirmed" },
      { tech: "Козлов Д.", time: "12:00 - 21:00", status: "pending" },
      { tech: "Петров В.", time: "Выходной", status: "off" },
    ]},
    { day: "Среда", date: "16.10", shifts: [
      { tech: "Сидоров К.", time: "09:00 - 18:00", status: "confirmed" },
      { tech: "Петров В.", time: "12:00 - 21:00", status: "confirmed" },
      { tech: "Иванов А.", time: "Выходной", status: "off" },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">График работы</h2>
          <p className="text-muted-foreground">Планирование смен и рабочего времени</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Icon name="Download" className="h-4 w-4" />
            Экспорт
          </Button>
          <Button className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Добавить смену
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Смен на неделе</CardTitle>
            <Icon name="Calendar" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">6 техников</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Покрытие</CardTitle>
            <Icon name="Clock" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground mt-1">Рабочих часов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Требуют подтверждения</CardTitle>
            <Icon name="AlertCircle" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Смены</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>График на неделю</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {schedule.map((day) => (
              <div key={day.day} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium w-32">{day.day}</div>
                  <Badge variant="outline">{day.date}</Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-3 ml-36">
                  {day.shifts.map((shift, idx) => (
                    <Card key={idx} className={`${
                      shift.status === 'off' ? 'bg-muted/50' : 
                      shift.status === 'pending' ? 'border-yellow-500' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{shift.tech}</div>
                          <Badge variant={
                            shift.status === 'confirmed' ? 'default' :
                            shift.status === 'pending' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {shift.status === 'confirmed' ? 'Подтвержден' :
                             shift.status === 'pending' ? 'Ожидание' : 'Выходной'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="Clock" className="h-4 w-4" />
                          <span>{shift.time}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleSection;

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { scheduleService } from "@/services/scheduleService";
import { technicianService } from "@/services/technicianService";
import { repairService } from "@/services/repairService";
import { Schedule } from "@/types";
import { toast } from "sonner";

const ScheduleSection = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(scheduleService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterTechnicianId, setFilterTechnicianId] = useState<string>("");

  const technicians = technicianService.getAll();
  const repairs = repairService.getAll();

  const [formData, setFormData] = useState({
    technicianId: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
    notes: "",
    isRecurring: false,
    recurringDays: [] as number[]
  });

  const groupSchedulesByDate = () => {
    const grouped: { [key: string]: Schedule[] } = {};
    let filteredSchedules = schedules;

    if (filterTechnicianId) {
      filteredSchedules = schedules.filter(s => s.technicianId === filterTechnicianId);
    }

    filteredSchedules.forEach(schedule => {
      const dateKey = schedule.date.toLocaleDateString('ru-RU');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });
    return grouped;
  };

  const getWeekSchedules = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    const weekSchedules = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const daySchedules = schedules.filter(s => 
        s.date.toDateString() === date.toDateString() &&
        (!filterTechnicianId || s.technicianId === filterTechnicianId)
      );
      weekSchedules.push({ date, schedules: daySchedules });
    }
    return weekSchedules;
  };

  const getScheduleStats = useMemo(() => {
    const totalHours = schedules.reduce((sum, schedule) => {
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const hours = (endH * 60 + endM - startH * 60 - startM) / 60;
      
      if (schedule.breakStart && schedule.breakEnd) {
        const [breakStartH, breakStartM] = schedule.breakStart.split(':').map(Number);
        const [breakEndH, breakEndM] = schedule.breakEnd.split(':').map(Number);
        const breakHours = (breakEndH * 60 + breakEndM - breakStartH * 60 - breakStartM) / 60;
        return sum + hours - breakHours;
      }
      return sum + hours;
    }, 0);

    const avgHoursPerDay = schedules.length > 0 ? totalHours / schedules.length : 0;
    
    const techWorkload: { [key: string]: number } = {};
    schedules.forEach(schedule => {
      if (!techWorkload[schedule.technicianName]) {
        techWorkload[schedule.technicianName] = 0;
      }
      techWorkload[schedule.technicianName]++;
    });

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      mostBusyTechnician: Object.keys(techWorkload).sort((a, b) => techWorkload[b] - techWorkload[a])[0] || '-',
      techWorkload
    };
  }, [schedules]);

  const getTechnicianScheduleForDate = (techId: string, date: Date) => {
    return schedules.find(s => 
      s.technicianId === techId && 
      s.date.toDateString() === date.toDateString()
    );
  };

  const getTechnicianRepairsForDate = (techId: string, date: Date) => {
    return repairs.filter(r => 
      r.technicianId === techId && 
      r.scheduledDate && 
      new Date(r.scheduledDate).toDateString() === date.toDateString()
    );
  };

  const groupedSchedules = groupSchedulesByDate();

  const handleCreate = () => {
    const technician = technicians.find(t => t.id === formData.technicianId);
    if (!technician) {
      toast.error("Выберите техника");
      return;
    }

    if (formData.isRecurring && formData.recurringDays.length > 0) {
      const nextMonth = new Date(formData.date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      let created = 0;
      for (let d = new Date(formData.date); d <= nextMonth; d.setDate(d.getDate() + 1)) {
        if (formData.recurringDays.includes(d.getDay())) {
          scheduleService.create({
            ...formData,
            date: new Date(d),
            technicianName: technician.name
          });
          created++;
        }
      }
      toast.success(`Создано ${created} смен`);
    } else {
      scheduleService.create({
        ...formData,
        technicianName: technician.name
      });
      toast.success("Смена создана");
    }

    setSchedules(scheduleService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingSchedule) return;
    
    const technician = technicians.find(t => t.id === formData.technicianId);
    if (!technician) {
      toast.error("Выберите техника");
      return;
    }

    scheduleService.update(editingSchedule.id, {
      ...formData,
      technicianName: technician.name
    });
    setSchedules(scheduleService.getAll());
    setEditingSchedule(null);
    resetForm();
    toast.success("Смена обновлена");
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить смену?")) {
      scheduleService.delete(id);
      setSchedules(scheduleService.getAll());
      toast.success("Смена удалена");
    }
  };

  const handleDuplicate = (schedule: Schedule) => {
    const newDate = new Date(schedule.date);
    newDate.setDate(newDate.getDate() + 1);
    
    scheduleService.create({
      ...schedule,
      date: newDate
    });
    setSchedules(scheduleService.getAll());
    toast.success("Смена дублирована на следующий день");
  };

  const resetForm = () => {
    setFormData({
      technicianId: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "18:00",
      breakStart: "13:00",
      breakEnd: "14:00",
      notes: "",
      isRecurring: false,
      recurringDays: []
    });
  };

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      technicianId: schedule.technicianId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakStart: schedule.breakStart || "13:00",
      breakEnd: schedule.breakEnd || "14:00",
      notes: schedule.notes || "",
      isRecurring: false,
      recurringDays: []
    });
  };

  const ScheduleForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Техник</Label>
        <Select value={formData.technicianId} onValueChange={(val) => setFormData({...formData, technicianId: val})}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите техника" />
          </SelectTrigger>
          <SelectContent>
            {technicians.map(tech => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name} - {tech.specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Дата</Label>
        <Input 
          type="date"
          value={formData.date.toISOString().split('T')[0]} 
          onChange={(e) => setFormData({...formData, date: new Date(e.target.value)})} 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Начало смены</Label>
          <Input 
            type="time"
            value={formData.startTime} 
            onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
          />
        </div>
        <div>
          <Label>Конец смены</Label>
          <Input 
            type="time"
            value={formData.endTime} 
            onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Начало перерыва</Label>
          <Input 
            type="time"
            value={formData.breakStart} 
            onChange={(e) => setFormData({...formData, breakStart: e.target.value})} 
          />
        </div>
        <div>
          <Label>Конец перерыва</Label>
          <Input 
            type="time"
            value={formData.breakEnd} 
            onChange={(e) => setFormData({...formData, breakEnd: e.target.value})} 
          />
        </div>
      </div>

      {!editingSchedule && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="recurring">Повторяющееся расписание</Label>
          </div>
          
          {formData.isRecurring && (
            <div className="flex gap-2 flex-wrap">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                <Button
                  key={day}
                  type="button"
                  size="sm"
                  variant={formData.recurringDays.includes(index + 1) ? "default" : "outline"}
                  onClick={() => {
                    const days = formData.recurringDays.includes(index + 1)
                      ? formData.recurringDays.filter(d => d !== index + 1)
                      : [...formData.recurringDays, index + 1];
                    setFormData({...formData, recurringDays: days});
                  }}
                >
                  {day}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div>
        <Label>Примечания</Label>
        <Textarea 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          placeholder="Дополнительная информация о смене" 
          rows={3}
        />
      </div>
      
      <Button onClick={editingSchedule ? handleUpdate : handleCreate} className="w-full">
        {editingSchedule ? "Сохранить изменения" : "Создать смену"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">График работы</h2>
          <p className="text-muted-foreground">Планирование смен и рабочего времени техников</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setEditingSchedule(null); }}>
                <Icon name="Plus" className="h-4 w-4" />
                Добавить смену
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая смена</DialogTitle>
              </DialogHeader>
              <ScheduleForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего смен</CardTitle>
            <Icon name="Calendar" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Часов работы</CardTitle>
            <Icon name="Clock" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getScheduleStats.totalHours}ч</div>
            <p className="text-xs text-muted-foreground mt-1">Всего часов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Средняя смена</CardTitle>
            <Icon name="TrendingUp" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getScheduleStats.avgHoursPerDay}ч</div>
            <p className="text-xs text-muted-foreground mt-1">В день</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Самый занятый</CardTitle>
            <Icon name="Users" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{getScheduleStats.mostBusyTechnician}</div>
            <p className="text-xs text-muted-foreground mt-1">Техник</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
            size="sm"
          >
            <Icon name="CalendarDays" className="h-4 w-4 mr-2" />
            Неделя
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            <Icon name="List" className="h-4 w-4 mr-2" />
            Список
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterTechnicianId} onValueChange={setFilterTechnicianId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все техники" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все техники</SelectItem>
              {technicians.map(tech => (
                <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {viewMode === "week" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
              >
                <Icon name="ChevronLeft" className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
              >
                <Icon name="ChevronRight" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {viewMode === "week" && (
        <div className="grid gap-4 md:grid-cols-7">
          {getWeekSchedules().map(({ date, schedules: daySchedules }, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <Card key={index} className={`${isToday ? 'ring-2 ring-primary' : ''} ${isWeekend ? 'bg-muted/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </div>
                      <div className="text-2xl font-bold">
                        {date.getDate()}
                      </div>
                    </div>
                    {isToday && <Badge variant="default">Сегодня</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySchedules.length > 0 ? (
                    daySchedules.map(schedule => (
                      <div key={schedule.id} className="text-xs space-y-1 p-2 bg-primary/5 rounded border border-primary/10">
                        <div className="font-medium truncate">{schedule.technicianName}</div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Icon name="Clock" className="h-3 w-3" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      Нет смен
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Расписание смен</CardTitle>
            <CardDescription>
              {filterTechnicianId 
                ? `Смены техника: ${technicians.find(t => t.id === filterTechnicianId)?.name}`
                : 'Все смены'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedSchedules).sort((a, b) => {
                const dateA = a[1][0].date;
                const dateB = b[1][0].date;
                return dateB.getTime() - dateA.getTime();
              }).map(([dateKey, daySchedules]) => (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm font-medium">
                      <Icon name="Calendar" className="h-4 w-4 mr-2" />
                      {dateKey}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {daySchedules.length} {daySchedules.length === 1 ? 'смена' : 'смен'}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {daySchedules.map((schedule) => {
                      const techRepairs = getTechnicianRepairsForDate(schedule.technicianId, schedule.date);
                      
                      return (
                        <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium">{schedule.technicianName}</div>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  ID: {schedule.id}
                                </Badge>
                              </div>
                              {techRepairs.length > 0 && (
                                <Badge variant="default">
                                  {techRepairs.length} заявок
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <Icon name="Clock" className="h-4 w-4 flex-shrink-0" />
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                              {schedule.breakStart && schedule.breakEnd && (
                                <div className="flex items-center gap-2">
                                  <Icon name="Coffee" className="h-4 w-4 flex-shrink-0" />
                                  <span>Перерыв: {schedule.breakStart} - {schedule.breakEnd}</span>
                                </div>
                              )}
                              {schedule.notes && (
                                <div className="flex items-start gap-2">
                                  <Icon name="FileText" className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{schedule.notes}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDuplicate(schedule)}
                                title="Дублировать на следующий день"
                              >
                                <Icon name="Copy" className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(schedule)}>
                                    <Icon name="Edit" className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать смену</DialogTitle>
                                  </DialogHeader>
                                  <ScheduleForm />
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(schedule.id)}
                              >
                                <Icon name="Trash2" className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(groupedSchedules).length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Calendar" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Нет запланированных смен</p>
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Создать первую смену
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleSection;

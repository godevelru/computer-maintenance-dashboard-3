import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { scheduleService } from "@/services/scheduleService";
import { technicianService } from "@/services/technicianService";
import { Schedule } from "@/types";

const ScheduleSection = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(scheduleService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const technicians = technicianService.getAll();

  const [formData, setFormData] = useState({
    technicianId: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "18:00",
    breakStart: "",
    breakEnd: "",
    notes: ""
  });

  const groupSchedulesByDate = () => {
    const grouped: { [key: string]: Schedule[] } = {};
    schedules.forEach(schedule => {
      const dateKey = schedule.date.toLocaleDateString('ru-RU');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });
    return grouped;
  };

  const groupedSchedules = groupSchedulesByDate();

  const handleCreate = () => {
    const technician = technicians.find(t => t.id === formData.technicianId);
    if (!technician) return;

    scheduleService.create({
      ...formData,
      technicianName: technician.name
    });
    setSchedules(scheduleService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingSchedule) return;
    
    const technician = technicians.find(t => t.id === formData.technicianId);
    if (!technician) return;

    scheduleService.update(editingSchedule.id, {
      ...formData,
      technicianName: technician.name
    });
    setSchedules(scheduleService.getAll());
    setEditingSchedule(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить смену?")) {
      scheduleService.delete(id);
      setSchedules(scheduleService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      technicianId: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "18:00",
      breakStart: "",
      breakEnd: "",
      notes: ""
    });
  };

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      technicianId: schedule.technicianId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakStart: schedule.breakStart || "",
      breakEnd: schedule.breakEnd || "",
      notes: schedule.notes || ""
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
              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
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
      
      <div>
        <Label>Примечания</Label>
        <Input 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          placeholder="Дополнительная информация" 
        />
      </div>
      
      <Button onClick={editingSchedule ? handleUpdate : handleCreate} className="w-full">
        {editingSchedule ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">График работы</h2>
          <p className="text-muted-foreground">Планирование смен и рабочего времени</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setEditingSchedule(null); }}>
                <Icon name="Plus" className="h-4 w-4" />
                Добавить смену
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая смена</DialogTitle>
              </DialogHeader>
              <ScheduleForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Активных техников</CardTitle>
            <Icon name="Users" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{technicians.length}</div>
            <p className="text-xs text-muted-foreground mt-1">В системе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Уникальных дат</CardTitle>
            <Icon name="Clock" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(groupedSchedules).length}</div>
            <p className="text-xs text-muted-foreground mt-1">В расписании</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Расписание смен</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([dateKey, daySchedules]) => (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-medium">{dateKey}</Badge>
                  <div className="text-sm text-muted-foreground">
                    {daySchedules.length} {daySchedules.length === 1 ? 'смена' : 'смен'}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {daySchedules.map((schedule) => (
                    <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{schedule.technicianName}</div>
                          <Badge variant="default" className="text-xs">
                            ID: {schedule.id}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Icon name="Clock" className="h-4 w-4" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          {schedule.breakStart && schedule.breakEnd && (
                            <div className="flex items-center gap-2">
                              <Icon name="Coffee" className="h-4 w-4" />
                              <span>Перерыв: {schedule.breakStart} - {schedule.breakEnd}</span>
                            </div>
                          )}
                          {schedule.notes && (
                            <div className="flex items-center gap-2">
                              <Icon name="FileText" className="h-4 w-4" />
                              <span>{schedule.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(schedule)}>
                                <Icon name="Edit" className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
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
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedSchedules).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Нет запланированных смен
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleSection;

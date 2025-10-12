import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { repairService } from "@/services/repairService";
import { clientService } from "@/services/clientService";
import { technicianService } from "@/services/technicianService";
import { Repair, RepairStatus, Priority } from "@/types";

const RepairsSection = () => {
  const [repairs, setRepairs] = useState<Repair[]>(repairService.getAll());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);

  const clients = clientService.getAll();
  const technicians = technicianService.getAll();

  const [formData, setFormData] = useState({
    clientId: "",
    deviceType: "",
    deviceModel: "",
    problem: "",
    status: "new" as RepairStatus,
    priority: "medium" as Priority,
    technicianId: "",
    estimatedCost: 0,
    notes: ""
  });

  const filteredRepairs = repairs.filter(repair => {
    const matchesStatus = statusFilter === "all" || repair.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || repair.priority === priorityFilter;
    const matchesSearch = searchQuery === "" || 
      repair.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreate = () => {
    const client = clients.find(c => c.id === formData.clientId);
    const technician = technicians.find(t => t.id === formData.technicianId);
    
    const newRepair = repairService.create({
      ...formData,
      clientName: client?.name || "",
      technicianName: technician?.name,
      finalCost: undefined,
      completedAt: undefined
    });
    
    setRepairs(repairService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingRepair) return;
    
    const client = clients.find(c => c.id === formData.clientId);
    const technician = technicians.find(t => t.id === formData.technicianId);
    
    repairService.update(editingRepair.id, {
      ...formData,
      clientName: client?.name || "",
      technicianName: technician?.name
    });
    
    setRepairs(repairService.getAll());
    setEditingRepair(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить заявку?")) {
      repairService.delete(id);
      setRepairs(repairService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      deviceType: "",
      deviceModel: "",
      problem: "",
      status: "new",
      priority: "medium",
      technicianId: "",
      estimatedCost: 0,
      notes: ""
    });
  };

  const openEdit = (repair: Repair) => {
    setEditingRepair(repair);
    setFormData({
      clientId: repair.clientId,
      deviceType: repair.deviceType,
      deviceModel: repair.deviceModel,
      problem: repair.problem,
      status: repair.status,
      priority: repair.priority,
      technicianId: repair.technicianId || "",
      estimatedCost: repair.estimatedCost,
      notes: repair.notes || ""
    });
  };

  const getStatusBadge = (status: RepairStatus) => {
    const variants = {
      new: "secondary",
      in_progress: "default",
      waiting_parts: "outline",
      completed: "outline",
      cancelled: "destructive"
    };
    const labels = {
      new: "Новая",
      in_progress: "В работе",
      waiting_parts: "Ожидание деталей",
      completed: "Завершено",
      cancelled: "Отменено"
    };
    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  const RepairForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Клиент</Label>
        <Select value={formData.clientId} onValueChange={(val) => setFormData({...formData, clientId: val})}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите клиента" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Тип устройства</Label>
        <Input value={formData.deviceType} onChange={(e) => setFormData({...formData, deviceType: e.target.value})} placeholder="Ноутбук, ПК, Моноблок..." />
      </div>
      
      <div>
        <Label>Модель</Label>
        <Input value={formData.deviceModel} onChange={(e) => setFormData({...formData, deviceModel: e.target.value})} placeholder="Lenovo ThinkPad..." />
      </div>
      
      <div>
        <Label>Проблема</Label>
        <Input value={formData.problem} onChange={(e) => setFormData({...formData, problem: e.target.value})} placeholder="Описание проблемы" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Статус</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val as RepairStatus})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Новая</SelectItem>
              <SelectItem value="in_progress">В работе</SelectItem>
              <SelectItem value="waiting_parts">Ожидание деталей</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
              <SelectItem value="cancelled">Отменено</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Приоритет</Label>
          <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val as Priority})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="urgent">Срочный</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
        <Label>Ориентировочная стоимость</Label>
        <Input type="number" value={formData.estimatedCost} onChange={(e) => setFormData({...formData, estimatedCost: Number(e.target.value)})} />
      </div>
      
      <div>
        <Label>Примечания</Label>
        <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
      </div>
      
      <Button onClick={editingRepair ? handleUpdate : handleCreate} className="w-full">
        {editingRepair ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Заявки на ремонт</h2>
          <p className="text-muted-foreground">Управление заявками на обслуживание</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetForm(); setEditingRepair(null); }}>
              <Icon name="Plus" className="h-4 w-4" />
              Новая заявка
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая заявка</DialogTitle>
            </DialogHeader>
            <RepairForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Поиск по ID, устройству, клиенту..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full" 
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="waiting_parts">Ожидание деталей</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Устройство</th>
                  <th className="p-3 text-left font-medium">Проблема</th>
                  <th className="p-3 text-left font-medium">Клиент</th>
                  <th className="p-3 text-left font-medium">Статус</th>
                  <th className="p-3 text-left font-medium">Стоимость</th>
                  <th className="p-3 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{repair.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Monitor" className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{repair.deviceModel}</div>
                          <div className="text-xs text-muted-foreground">{repair.deviceType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{repair.problem}</td>
                    <td className="p-3 text-sm">{repair.clientName}</td>
                    <td className="p-3">{getStatusBadge(repair.status)}</td>
                    <td className="p-3 font-medium">{repair.estimatedCost}₽</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(repair)}>
                              <Icon name="Edit" className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Редактировать заявку</DialogTitle>
                            </DialogHeader>
                            <RepairForm />
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(repair.id)}>
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairsSection;

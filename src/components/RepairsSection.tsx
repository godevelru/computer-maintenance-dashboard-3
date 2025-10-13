import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { repairService } from "@/services/repairService";
import { clientService } from "@/services/clientService";
import { technicianService } from "@/services/technicianService";
import { Repair, RepairStatus, Priority } from "@/types";
import { toast } from "sonner";

const RepairsSection = () => {
  const [repairs, setRepairs] = useState<Repair[]>(repairService.getAll());
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

  const newRepairs = repairs.filter(r => r.status === "new").length;
  const inProgressRepairs = repairs.filter(r => r.status === "in_progress").length;
  const completedRepairs = repairs.filter(r => r.status === "completed").length;

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

  const getPriorityBadge = (priority: Priority) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive"
    };
    const labels = {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      urgent: "Срочный"
    };
    return <Badge variant={variants[priority] as any}>{labels[priority]}</Badge>;
  };

  const columns: Column<Repair>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'deviceModel', 
      label: 'Устройство', 
      render: (repair) => (
        <div className="flex items-center gap-2">
          <Icon name="Monitor" className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{repair.deviceModel}</div>
            <div className="text-xs text-muted-foreground">{repair.deviceType}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'problem', 
      label: 'Проблема', 
      render: (repair) => <span className="text-sm">{repair.problem}</span>,
      sortable: true
    },
    { 
      key: 'clientName', 
      label: 'Клиент', 
      render: (repair) => <span className="text-sm">{repair.clientName}</span>,
      sortable: true
    },
    { 
      key: 'status', 
      label: 'Статус', 
      render: (repair) => getStatusBadge(repair.status),
      sortable: true
    },
    { 
      key: 'priority', 
      label: 'Приоритет', 
      render: (repair) => getPriorityBadge(repair.priority),
      sortable: true
    },
    { 
      key: 'estimatedCost', 
      label: 'Стоимость', 
      render: (repair) => <span className="font-medium">{repair.estimatedCost}₽</span>,
      sortable: true,
      width: 'w-[120px]'
    }
  ];

  const filters: Filter[] = [
    {
      key: 'status',
      label: 'Статус',
      options: [
        { value: 'new', label: 'Новые' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'waiting_parts', label: 'Ожидание деталей' },
        { value: 'completed', label: 'Завершено' },
        { value: 'cancelled', label: 'Отменено' }
      ]
    },
    {
      key: 'priority',
      label: 'Приоритет',
      options: [
        { value: 'urgent', label: 'Срочный' },
        { value: 'high', label: 'Высокий' },
        { value: 'medium', label: 'Средний' },
        { value: 'low', label: 'Низкий' }
      ]
    }
  ];

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
        <div className="flex gap-2">
          <ImportExportDialog
            data={repairs}
            filename="repairs"
            title="Заявки на ремонт"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'deviceModel', label: 'Модель' },
              { key: 'deviceType', label: 'Тип' },
              { key: 'problem', label: 'Проблема' },
              { key: 'clientName', label: 'Клиент' },
              { key: 'status', label: 'Статус' },
              { key: 'priority', label: 'Приоритет' },
              { key: 'estimatedCost', label: 'Стоимость' },
            ]}
            onImport={(data) => {
              toast.success(`Импортировано ${data.length} заявок`);
            }}
          />
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
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Новые заявки</CardTitle>
            <Icon name="AlertCircle" className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newRepairs}</div>
            <p className="text-xs text-muted-foreground mt-1">Ожидают назначения</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Icon name="Wrench" className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressRepairs}</div>
            <p className="text-xs text-muted-foreground mt-1">Активных ремонтов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedRepairs}</div>
            <p className="text-xs text-muted-foreground mt-1">Готовы к выдаче</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={repairs}
        columns={columns}
        filters={filters}
        searchKeys={['id', 'deviceModel', 'deviceType', 'problem', 'clientName']}
        searchPlaceholder="Поиск по ID, устройству, клиенту..."
        renderActions={(repair) => (
          <>
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
          </>
        )}
        emptyMessage="Нет заявок на ремонт"
      />
    </div>
  );
};

export default RepairsSection;
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'all' | 'completed'>('active');

  const clients = clientService.getAll();
  const technicians = technicianService.getAll();

  const [formData, setFormData] = useState({
    clientId: "",
    deviceType: "",
    deviceModel: "",
    serialNumber: "",
    problem: "",
    diagnosis: "",
    status: "new" as RepairStatus,
    priority: "medium" as Priority,
    technicianId: "",
    estimatedCost: 0,
    estimatedDays: 1,
    notes: "",
    accessories: ""
  });

  const filteredRepairs = useMemo(() => {
    switch(viewMode) {
      case 'active':
        return repairs.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
      case 'completed':
        return repairs.filter(r => r.status === 'completed' || r.status === 'cancelled');
      default:
        return repairs;
    }
  }, [repairs, viewMode]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const newRepairs = repairs.filter(r => r.status === "new").length;
    const inProgress = repairs.filter(r => r.status === "in_progress").length;
    const waitingParts = repairs.filter(r => r.status === "waiting_parts").length;
    const completed = repairs.filter(r => r.status === "completed").length;
    const cancelled = repairs.filter(r => r.status === "cancelled").length;
    const urgent = repairs.filter(r => r.priority === "urgent" && r.status !== "completed").length;

    const completedToday = repairs.filter(r => 
      r.status === "completed" && 
      r.completedAt && 
      new Date(r.completedAt) >= todayStart
    ).length;

    const revenueToday = repairs
      .filter(r => r.status === "completed" && r.completedAt && new Date(r.completedAt) >= todayStart)
      .reduce((sum, r) => sum + (r.finalCost || 0), 0);

    const totalRevenue = repairs
      .filter(r => r.status === "completed" && r.finalCost)
      .reduce((sum, r) => sum + (r.finalCost || 0), 0);

    const avgRepairTime = completed > 0 
      ? repairs
          .filter(r => r.status === "completed" && r.completedAt)
          .reduce((sum, r) => {
            const created = new Date(r.createdAt).getTime();
            const completedTime = new Date(r.completedAt!).getTime();
            return sum + (completedTime - created);
          }, 0) / completed / (1000 * 60 * 60 * 24)
      : 0;

    const deviceTypes = repairs.reduce((acc, r) => {
      acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      new: newRepairs,
      inProgress,
      waitingParts,
      completed,
      cancelled,
      urgent,
      completedToday,
      revenueToday,
      totalRevenue,
      avgRepairTime: Math.round(avgRepairTime * 10) / 10,
      deviceTypes,
      active: newRepairs + inProgress + waitingParts
    };
  }, [repairs]);

  const handleCreate = () => {
    const client = clients.find(c => c.id === formData.clientId);
    const technician = technicians.find(t => t.id === formData.technicianId);
    
    repairService.create({
      ...formData,
      clientName: client?.name || "",
      technicianName: technician?.name,
      finalCost: undefined,
      completedAt: undefined
    });
    
    setRepairs(repairService.getAll());
    setIsCreateOpen(false);
    resetForm();
    toast.success('Заявка создана');
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
    toast.success('Заявка обновлена');
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить заявку?")) {
      repairService.delete(id);
      setRepairs(repairService.getAll());
      toast.success('Заявка удалена');
    }
  };

  const handleDuplicate = (repair: Repair) => {
    setFormData({
      clientId: repair.clientId,
      deviceType: repair.deviceType,
      deviceModel: repair.deviceModel,
      serialNumber: (repair as any).serialNumber || "",
      problem: repair.problem,
      diagnosis: (repair as any).diagnosis || "",
      status: "new",
      priority: repair.priority,
      technicianId: repair.technicianId || "",
      estimatedCost: repair.estimatedCost,
      estimatedDays: (repair as any).estimatedDays || 1,
      notes: repair.notes || "",
      accessories: (repair as any).accessories || ""
    });
    setIsCreateOpen(true);
    toast.info('Форма заполнена данными из заявки');
  };

  const handleQuickStatusChange = (repair: Repair, newStatus: RepairStatus) => {
    repairService.update(repair.id, { status: newStatus });
    setRepairs(repairService.getAll());
    toast.success(`Статус изменён на ${getStatusLabel(newStatus)}`);
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      deviceType: "",
      deviceModel: "",
      serialNumber: "",
      problem: "",
      diagnosis: "",
      status: "new",
      priority: "medium",
      technicianId: "",
      estimatedCost: 0,
      estimatedDays: 1,
      notes: "",
      accessories: ""
    });
  };

  const openEdit = (repair: Repair) => {
    setEditingRepair(repair);
    setFormData({
      clientId: repair.clientId,
      deviceType: repair.deviceType,
      deviceModel: repair.deviceModel,
      serialNumber: (repair as any).serialNumber || "",
      problem: repair.problem,
      diagnosis: (repair as any).diagnosis || "",
      status: repair.status,
      priority: repair.priority,
      technicianId: repair.technicianId || "",
      estimatedCost: repair.estimatedCost,
      estimatedDays: (repair as any).estimatedDays || 1,
      notes: repair.notes || "",
      accessories: (repair as any).accessories || ""
    });
  };

  const getStatusLabel = (status: RepairStatus) => {
    const labels: Record<RepairStatus, string> = {
      new: "Новая",
      in_progress: "В работе",
      waiting_parts: "Ожидание деталей",
      completed: "Завершено",
      cancelled: "Отменено"
    };
    return labels[status];
  };

  const getStatusBadge = (status: RepairStatus) => {
    const variants: Record<RepairStatus, any> = {
      new: { variant: "secondary", color: "bg-blue-100 text-blue-700" },
      in_progress: { variant: "default", color: "bg-orange-100 text-orange-700" },
      waiting_parts: { variant: "outline", color: "bg-yellow-100 text-yellow-700" },
      completed: { variant: "outline", color: "bg-green-100 text-green-700" },
      cancelled: { variant: "destructive", color: "bg-red-100 text-red-700" }
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.color}>{getStatusLabel(status)}</Badge>;
  };

  const getPriorityBadge = (priority: Priority) => {
    const variants: Record<Priority, any> = {
      low: { variant: "outline", label: "Низкий" },
      medium: { variant: "secondary", label: "Средний" },
      high: { variant: "default", label: "Высокий" },
      urgent: { variant: "destructive", label: "Срочный" }
    };
    const config = variants[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRepairDuration = (repair: Repair) => {
    const start = new Date(repair.createdAt);
    const end = repair.completedAt ? new Date(repair.completedAt) : new Date();
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const columns: Column<Repair>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      render: (repair) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium">#{repair.id}</span>
          {repair.priority === 'urgent' && (
            <Icon name="Zap" className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
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
      key: 'clientName', 
      label: 'Клиент', 
      render: (repair) => {
        const client = clients.find(c => c.id === repair.clientId);
        return (
          <div>
            <div className="font-medium text-sm">{repair.clientName}</div>
            {client && (
              <div className="text-xs text-muted-foreground">{client.phone}</div>
            )}
          </div>
        );
      },
      sortable: true
    },
    { 
      key: 'status', 
      label: 'Статус', 
      render: (repair) => (
        <div className="space-y-1">
          {getStatusBadge(repair.status)}
          <div className="text-xs text-muted-foreground">
            {getRepairDuration(repair)} дн.
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'priority', 
      label: 'Приоритет', 
      render: (repair) => getPriorityBadge(repair.priority),
      sortable: true
    },
    { 
      key: 'technicianName', 
      label: 'Техник', 
      render: (repair) => (
        <div className="flex items-center gap-2">
          {repair.technicianName ? (
            <>
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {repair.technicianName.charAt(0)}
              </div>
              <span className="text-sm">{repair.technicianName}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Не назначен</span>
          )}
        </div>
      )
    },
    { 
      key: 'estimatedCost', 
      label: 'Стоимость', 
      render: (repair) => (
        <div>
          <div className="font-medium">₽{repair.finalCost || repair.estimatedCost}</div>
          {repair.finalCost && repair.finalCost !== repair.estimatedCost && (
            <div className="text-xs text-muted-foreground">
              план: ₽{repair.estimatedCost}
            </div>
          )}
        </div>
      ),
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
    },
    {
      key: 'deviceType',
      label: 'Тип устройства',
      options: Object.keys(stats.deviceTypes).map(type => ({ value: type, label: type }))
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
              <SelectItem key={client.id} value={client.id}>
                {client.name} • {client.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Тип устройства</Label>
          <Input 
            list="device-types"
            value={formData.deviceType} 
            onChange={(e) => setFormData({...formData, deviceType: e.target.value})} 
            placeholder="Ноутбук, ПК, Моноблок..." 
          />
          <datalist id="device-types">
            {Object.keys(stats.deviceTypes).map(type => <option key={type} value={type} />)}
          </datalist>
        </div>
        <div>
          <Label>Модель</Label>
          <Input 
            value={formData.deviceModel} 
            onChange={(e) => setFormData({...formData, deviceModel: e.target.value})} 
            placeholder="Lenovo ThinkPad T480" 
          />
        </div>
      </div>

      <div>
        <Label>Серийный номер</Label>
        <Input 
          value={formData.serialNumber} 
          onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} 
          placeholder="S/N: ABC123XYZ456" 
        />
      </div>

      <div>
        <Label>Комплектация</Label>
        <Input 
          value={formData.accessories} 
          onChange={(e) => setFormData({...formData, accessories: e.target.value})} 
          placeholder="Зарядное устройство, сумка" 
        />
      </div>
      
      <div>
        <Label>Проблема (со слов клиента)</Label>
        <Textarea 
          value={formData.problem} 
          onChange={(e) => setFormData({...formData, problem: e.target.value})} 
          placeholder="Не включается, не заряжается..."
          rows={2}
        />
      </div>

      <div>
        <Label>Диагноз (после проверки)</Label>
        <Textarea 
          value={formData.diagnosis} 
          onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} 
          placeholder="Требуется замена блока питания..."
          rows={2}
        />
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
            {technicians.filter(t => t.status === 'available' || t.status === 'busy').map(tech => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name} • {tech.specialization.join(', ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ориентировочная стоимость (₽)</Label>
          <Input 
            type="number" 
            value={formData.estimatedCost} 
            onChange={(e) => setFormData({...formData, estimatedCost: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Срок выполнения (дней)</Label>
          <Input 
            type="number" 
            value={formData.estimatedDays} 
            onChange={(e) => setFormData({...formData, estimatedDays: Number(e.target.value)})} 
          />
        </div>
      </div>
      
      <div>
        <Label>Примечания</Label>
        <Textarea 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          placeholder="Дополнительная информация"
          rows={2}
        />
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
          <p className="text-muted-foreground">Управление заявками с детальной аналитикой</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto">
            <TabsList>
              <TabsTrigger value="active" className="gap-1">
                Активные
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {stats.active}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">Завершённые</TabsTrigger>
              <TabsTrigger value="all">Все</TabsTrigger>
            </TabsList>
          </Tabs>
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
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новая заявка на ремонт</DialogTitle>
              </DialogHeader>
              <RepairForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Новые</div>
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              </div>
              <Icon name="AlertCircle" className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">В работе</div>
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              </div>
              <Icon name="Wrench" className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Ожидание</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.waitingParts}</div>
              </div>
              <Icon name="Clock" className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Завершено</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </div>
              <Icon name="CheckCircle2" className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Срочных</div>
                <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              </div>
              <Icon name="Zap" className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Ср. время</div>
                <div className="text-2xl font-bold text-purple-600">{stats.avgRepairTime}д</div>
              </div>
              <Icon name="Timer" className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Срочные заявки</CardTitle>
                <CardDescription>Требуют первоочередного внимания</CardDescription>
              </div>
              <Badge variant="destructive">{stats.urgent} активных</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {repairs
                .filter(r => r.priority === 'urgent' && r.status !== 'completed')
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map(repair => (
                  <div key={repair.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Icon name="Zap" className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">#{repair.id}</span>
                          <span className="text-sm font-medium truncate">{repair.deviceModel}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {repair.clientName} • {getRepairDuration(repair)} дн. • {repair.technicianName || 'Не назначен'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(repair.status)}
                      <Button size="sm" variant="outline" onClick={() => setSelectedRepair(repair)}>
                        <Icon name="Eye" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              {repairs.filter(r => r.priority === 'urgent' && r.status !== 'completed').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="CheckCircle2" className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <div>Нет срочных заявок</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сегодня</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Завершено заявок</span>
                <Badge variant="outline">{stats.completedToday}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Выручка</span>
                <span className="font-bold text-green-600">₽{stats.revenueToday.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground mb-2">По типам устройств</div>
              <div className="space-y-2">
                {Object.entries(stats.deviceTypes)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="truncate">{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Общая статистика</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Всего заявок</span>
                  <span className="font-medium">{repairs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Общая выручка</span>
                  <span className="font-medium">₽{stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={filteredRepairs}
        columns={columns}
        filters={filters}
        searchKeys={['id', 'deviceModel', 'deviceType', 'problem', 'clientName']}
        searchPlaceholder="Поиск по ID, устройству, клиенту, проблеме..."
        renderActions={(repair) => (
          <>
            {repair.status !== 'completed' && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleQuickStatusChange(repair, 'completed')}
                title="Отметить завершённой"
              >
                <Icon name="Check" className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => handleDuplicate(repair)} title="Дублировать">
              <Icon name="Copy" className="h-4 w-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(repair)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Редактировать заявку #{repair.id}</DialogTitle>
                </DialogHeader>
                <RepairForm />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(repair.id)}>
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </>
        )}
        emptyMessage={
          viewMode === 'active' ? "Нет активных заявок" :
          viewMode === 'completed' ? "Нет завершённых заявок" :
          "Нет заявок на ремонт"
        }
      />
    </div>
  );
};

export default RepairsSection;

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { technicianService } from "@/services/technicianService";
import { repairService } from "@/services/repairService";
import { Technician, TechnicianStatus } from "@/types";
import { toast } from "sonner";

const TechniciansSection = () => {
  const [technicians, setTechnicians] = useState<Technician[]>(technicianService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'all'>('active');

  const repairs = repairService.getAll();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: [] as string[],
    status: "available" as TechnicianStatus,
    hourlyRate: 0,
    hireDate: new Date(),
    skills: "",
    certifications: "",
    notes: ""
  });

  const [specializationInput, setSpecializationInput] = useState("");

  const techsWithStats = useMemo(() => {
    return technicians.map(tech => {
      const techRepairs = repairs.filter(r => r.technicianId === tech.id);
      const activeRepairs = techRepairs.filter(r => 
        r.status === 'in_progress' || r.status === 'waiting_parts'
      ).length;
      const completedThisMonth = techRepairs.filter(r => {
        if (r.status !== 'completed' || !r.completedAt) return false;
        const completedDate = new Date(r.completedAt);
        const now = new Date();
        return completedDate.getMonth() === now.getMonth() && 
               completedDate.getFullYear() === now.getFullYear();
      }).length;
      
      const revenue = techRepairs
        .filter(r => r.status === 'completed' && r.finalCost)
        .reduce((sum, r) => sum + (r.finalCost || 0), 0);

      const avgRepairTime = tech.completedRepairs > 0
        ? techRepairs
            .filter(r => r.status === 'completed' && r.completedAt)
            .reduce((sum, r) => {
              const start = new Date(r.createdAt).getTime();
              const end = new Date(r.completedAt!).getTime();
              return sum + (end - start);
            }, 0) / tech.completedRepairs / (1000 * 60 * 60 * 24)
        : 0;

      const workload = activeRepairs / 5 * 100;

      return {
        ...tech,
        activeRepairs,
        completedThisMonth,
        revenue,
        avgRepairTime: Math.round(avgRepairTime * 10) / 10,
        workload: Math.min(Math.round(workload), 100)
      };
    });
  }, [technicians, repairs]);

  const filteredTechs = useMemo(() => {
    if (viewMode === 'active') {
      return techsWithStats.filter(t => t.status === 'available' || t.status === 'busy');
    }
    return techsWithStats;
  }, [techsWithStats, viewMode]);

  const stats = useMemo(() => {
    const active = technicians.filter(t => t.status === 'available' || t.status === 'busy').length;
    const available = technicians.filter(t => t.status === 'available').length;
    const busy = technicians.filter(t => t.status === 'busy').length;
    const onBreak = technicians.filter(t => t.status === 'on_break').length;
    
    const totalCompleted = technicians.reduce((sum, t) => sum + t.completedRepairs, 0);
    const avgRating = technicians.length > 0 
      ? (technicians.reduce((sum, t) => sum + t.rating, 0) / technicians.length).toFixed(1)
      : "0.0";
    
    const totalRevenue = techsWithStats.reduce((sum, t) => sum + t.revenue, 0);
    const totalWorkload = techsWithStats.reduce((sum, t) => sum + t.workload, 0) / (technicians.length || 1);

    const topPerformer = [...techsWithStats]
      .sort((a, b) => b.completedThisMonth - a.completedThisMonth)[0];

    return {
      total: technicians.length,
      active,
      available,
      busy,
      onBreak,
      totalCompleted,
      avgRating,
      totalRevenue,
      avgWorkload: Math.round(totalWorkload),
      topPerformer
    };
  }, [technicians, techsWithStats]);

  const handleCreate = () => {
    technicianService.create({
      ...formData,
      specialization: formData.specialization.length > 0 
        ? formData.specialization 
        : ["Общий ремонт"]
    });
    setTechnicians(technicianService.getAll());
    setIsCreateOpen(false);
    resetForm();
    toast.success('Техник добавлен');
  };

  const handleUpdate = () => {
    if (!editingTechnician) return;
    technicianService.update(editingTechnician.id, formData);
    setTechnicians(technicianService.getAll());
    setEditingTechnician(null);
    resetForm();
    toast.success('Техник обновлён');
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить техника? История его работы сохранится.")) {
      technicianService.delete(id);
      setTechnicians(technicianService.getAll());
      toast.success('Техник удалён');
    }
  };

  const handleQuickStatusChange = (tech: Technician, newStatus: TechnicianStatus) => {
    technicianService.update(tech.id, { status: newStatus });
    setTechnicians(technicianService.getAll());
    toast.success(`Статус изменён на ${getStatusLabel(newStatus)}`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: [],
      status: "available",
      hourlyRate: 0,
      hireDate: new Date(),
      skills: "",
      certifications: "",
      notes: ""
    });
    setSpecializationInput("");
  };

  const openEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name,
      email: technician.email,
      phone: technician.phone,
      specialization: technician.specialization,
      status: technician.status,
      hourlyRate: technician.hourlyRate,
      hireDate: technician.hireDate,
      skills: (technician as any).skills || "",
      certifications: (technician as any).certifications || "",
      notes: (technician as any).notes || ""
    });
  };

  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, specializationInput.trim()]
      });
      setSpecializationInput("");
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter((_, i) => i !== index)
    });
  };

  const getStatusLabel = (status: TechnicianStatus) => {
    const labels: Record<TechnicianStatus, string> = {
      available: "Доступен",
      busy: "Занят",
      on_break: "На перерыве",
      off_duty: "Не на смене"
    };
    return labels[status];
  };

  const getStatusBadge = (status: TechnicianStatus) => {
    const variants: Record<TechnicianStatus, any> = {
      available: { variant: "outline", color: "text-green-600 bg-green-50 border-green-200" },
      busy: { variant: "default", color: "text-orange-600 bg-orange-50 border-orange-200" },
      on_break: { variant: "secondary", color: "text-blue-600 bg-blue-50 border-blue-200" },
      off_duty: { variant: "secondary", color: "text-gray-600 bg-gray-50 border-gray-200" }
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.color}>{getStatusLabel(status)}</Badge>;
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'bg-red-500';
    if (workload >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const columns: Column<any>[] = [
    { 
      key: 'name', 
      label: 'Техник', 
      render: (tech) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {tech.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{tech.name}</div>
            <div className="text-xs text-muted-foreground">{tech.email}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'specialization', 
      label: 'Специализация', 
      render: (tech) => (
        <div className="flex flex-wrap gap-1">
          {tech.specialization.slice(0, 2).map((spec: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
          ))}
          {tech.specialization.length > 2 && (
            <Badge variant="outline" className="text-xs">+{tech.specialization.length - 2}</Badge>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Статус', 
      render: (tech) => getStatusBadge(tech.status),
      sortable: true
    },
    { 
      key: 'activeRepairs', 
      label: 'Активных', 
      render: (tech) => (
        <div className="space-y-1">
          <Badge variant={tech.activeRepairs > 0 ? 'default' : 'outline'}>
            {tech.activeRepairs}
          </Badge>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-16">
            <div 
              className={`h-full ${getWorkloadColor(tech.workload)} transition-all`}
              style={{ width: `${tech.workload}%` }}
            />
          </div>
        </div>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'completedThisMonth', 
      label: 'За месяц', 
      render: (tech) => (
        <div className="flex items-center gap-2">
          <Icon name="CheckCircle2" className="h-4 w-4 text-green-600" />
          <span className="font-medium">{tech.completedThisMonth}</span>
        </div>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'rating', 
      label: 'Рейтинг', 
      render: (tech) => (
        <div className="flex items-center gap-1">
          <Icon name="Star" className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-medium">{tech.rating.toFixed(1)}</span>
        </div>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'avgRepairTime', 
      label: 'Ср. время', 
      render: (tech) => (
        <div className="text-sm">
          {tech.avgRepairTime > 0 ? `${tech.avgRepairTime}д` : '—'}
        </div>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'revenue', 
      label: 'Выручка', 
      render: (tech) => (
        <span className="font-medium">₽{tech.revenue.toLocaleString()}</span>
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
        { value: 'available', label: 'Доступен' },
        { value: 'busy', label: 'Занят' },
        { value: 'on_break', label: 'На перерыве' },
        { value: 'off_duty', label: 'Не на смене' }
      ]
    }
  ];

  const TechnicianForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Имя и фамилия</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          placeholder="Иванов Алексей Петрович" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            placeholder="email@example.com" 
          />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            placeholder="+7 (999) 123-45-67" 
          />
        </div>
      </div>
      
      <div>
        <Label>Специализация</Label>
        <div className="flex gap-2 mb-2">
          <Input 
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            placeholder="Ноутбуки, ПК, Apple, Серверы..."
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
          />
          <Button type="button" variant="outline" onClick={addSpecialization}>
            <Icon name="Plus" className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specialization.map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1">
              {spec}
              <button onClick={() => removeSpecialization(idx)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Навыки и компетенции</Label>
        <Textarea 
          value={formData.skills} 
          onChange={(e) => setFormData({...formData, skills: e.target.value})} 
          placeholder="Диагностика материнских плат, пайка BGA, восстановление данных..."
          rows={2}
        />
      </div>

      <div>
        <Label>Сертификаты</Label>
        <Input 
          value={formData.certifications} 
          onChange={(e) => setFormData({...formData, certifications: e.target.value})} 
          placeholder="Apple Certified Mac Technician, CompTIA A+" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Статус</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val as TechnicianStatus})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Доступен</SelectItem>
              <SelectItem value="busy">Занят</SelectItem>
              <SelectItem value="on_break">На перерыве</SelectItem>
              <SelectItem value="off_duty">Не на смене</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Ставка (₽/час)</Label>
          <Input 
            type="number"
            value={formData.hourlyRate} 
            onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})} 
            placeholder="500" 
          />
        </div>
      </div>
      
      <div>
        <Label>Дата найма</Label>
        <Input 
          type="date"
          value={formData.hireDate instanceof Date ? formData.hireDate.toISOString().split('T')[0] : formData.hireDate}
          onChange={(e) => setFormData({...formData, hireDate: new Date(e.target.value)})} 
        />
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
      
      <Button onClick={editingTechnician ? handleUpdate : handleCreate} className="w-full">
        {editingTechnician ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Техники</h2>
          <p className="text-muted-foreground">Управление персоналом с детальной аналитикой</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto">
            <TabsList>
              <TabsTrigger value="active">На смене</TabsTrigger>
              <TabsTrigger value="all">Все</TabsTrigger>
            </TabsList>
          </Tabs>
          <ImportExportDialog
            data={technicians}
            filename="technicians"
            title="Техники"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Имя' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Телефон' },
              { key: 'specialization', label: 'Специализация' },
              { key: 'status', label: 'Статус' },
              { key: 'hourlyRate', label: 'Ставка' },
              { key: 'completedRepairs', label: 'Выполнено' },
              { key: 'rating', label: 'Рейтинг' },
            ]}
            onImport={(data) => {
              toast.success(`Импортировано ${data.length} техников`);
            }}
          />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setEditingTechnician(null); }}>
                <Icon name="UserPlus" className="h-4 w-4" />
                Добавить техника
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новый техник</DialogTitle>
              </DialogHeader>
              <TechnicianForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icon name="Users" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Всего техников</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Icon name="UserCheck" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.available}</div>
                <div className="text-xs text-muted-foreground">Доступны</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Icon name="Wrench" className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.busy}</div>
                <div className="text-xs text-muted-foreground">Заняты</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Icon name="CheckCircle2" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCompleted}</div>
                <div className="text-xs text-muted-foreground">Выполнено</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Icon name="Star" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgRating}</div>
                <div className="text-xs text-muted-foreground">Ср. рейтинг</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Рейтинг техников</CardTitle>
                <CardDescription>По выполненным заявкам за месяц</CardDescription>
              </div>
              {stats.topPerformer && (
                <Badge variant="default" className="gap-1">
                  <Icon name="Trophy" className="h-3 w-3" />
                  Лучший: {stats.topPerformer.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...techsWithStats]
                .sort((a, b) => b.completedThisMonth - a.completedThisMonth)
                .slice(0, 6)
                .map((tech, index) => (
                  <div key={tech.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{tech.name}</span>
                        {getStatusBadge(tech.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">{tech.specialization.join(', ')}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-medium">{tech.completedThisMonth} за месяц</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          <Icon name="Star" className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {tech.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">₽{tech.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Выручка</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Загрузка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Средняя загрузка</span>
                <Badge variant={stats.avgWorkload > 70 ? 'destructive' : 'outline'}>
                  {stats.avgWorkload}%
                </Badge>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getWorkloadColor(stats.avgWorkload)} transition-all`}
                  style={{ width: `${stats.avgWorkload}%` }}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-medium">Статусы</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Доступны</span>
                  </div>
                  <span className="font-medium">{stats.available}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Заняты</span>
                  </div>
                  <span className="font-medium">{stats.busy}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>На перерыве</span>
                  </div>
                  <span className="font-medium">{stats.onBreak}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Общая статистика</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Выполнено всего</span>
                  <span className="font-medium">{stats.totalCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Общая выручка</span>
                  <span className="font-medium text-green-600">₽{stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={filteredTechs}
        columns={columns}
        filters={filters}
        searchKeys={['name', 'email', 'phone', 'specialization']}
        searchPlaceholder="Поиск по имени, email, специализации..."
        renderActions={(tech) => (
          <>
            {tech.status !== 'available' && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleQuickStatusChange(tech, 'available')}
                title="Отметить доступным"
              >
                <Icon name="Check" className="h-4 w-4" />
              </Button>
            )}
            {tech.status !== 'busy' && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleQuickStatusChange(tech, 'busy')}
                title="Отметить занятым"
              >
                <Icon name="Clock" className="h-4 w-4" />
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(tech)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Редактировать техника</DialogTitle>
                </DialogHeader>
                <TechnicianForm />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(tech.id)}>
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </>
        )}
        emptyMessage={viewMode === 'active' ? "Нет техников на смене" : "Нет техников в системе"}
      />
    </div>
  );
};

export default TechniciansSection;

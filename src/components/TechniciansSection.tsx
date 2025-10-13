import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { technicianService } from "@/services/technicianService";
import { Technician, TechnicianStatus } from "@/types";
import { toast } from "sonner";

const TechniciansSection = () => {
  const [technicians, setTechnicians] = useState<Technician[]>(technicianService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: [] as string[],
    status: "available" as TechnicianStatus,
    hourlyRate: 0,
    hireDate: new Date()
  });

  const [specializationInput, setSpecializationInput] = useState("");

  const activeTechnicians = technicians.filter(t => t.status === "available" || t.status === "busy");
  const totalTasks = technicians.reduce((sum, t) => sum + t.completedRepairs, 0);
  const avgRating = technicians.length > 0 
    ? (technicians.reduce((sum, t) => sum + t.rating, 0) / technicians.length).toFixed(1)
    : "0.0";

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
  };

  const handleUpdate = () => {
    if (!editingTechnician) return;
    technicianService.update(editingTechnician.id, formData);
    setTechnicians(technicianService.getAll());
    setEditingTechnician(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить техника?")) {
      technicianService.delete(id);
      setTechnicians(technicianService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: [],
      status: "available",
      hourlyRate: 0,
      hireDate: new Date()
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
      hireDate: technician.hireDate
    });
  };

  const addSpecialization = () => {
    if (specializationInput.trim()) {
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

  const getStatusBadge = (status: TechnicianStatus) => {
    const variants = {
      available: "outline",
      busy: "default",
      on_break: "secondary",
      off_duty: "secondary"
    };
    const labels = {
      available: "Доступен",
      busy: "Занят",
      on_break: "На перерыве",
      off_duty: "Не на смене"
    };
    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  const columns: Column<Technician>[] = [
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
          {tech.specialization.map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
          ))}
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
      key: 'completedRepairs', 
      label: 'Выполнено', 
      render: (tech) => (
        <div className="flex items-center gap-2">
          <Icon name="CheckCircle2" className="h-4 w-4 text-green-600" />
          <span className="font-medium">{tech.completedRepairs}</span>
        </div>
      ),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'hourlyRate', 
      label: 'Ставка', 
      render: (tech) => (
        <span className="font-medium">₽{tech.hourlyRate}/час</span>
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
        <Label>Имя</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          placeholder="Иванов Алексей" 
        />
      </div>
      
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
      
      <div>
        <Label>Специализация</Label>
        <div className="flex gap-2 mb-2">
          <Input 
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            placeholder="Ноутбуки, ПК, Apple..."
            onKeyPress={(e) => e.key === "Enter" && addSpecialization()}
          />
          <Button type="button" variant="outline" onClick={addSpecialization}>
            Добавить
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specialization.map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1">
              {spec}
              <button onClick={() => removeSpecialization(idx)} className="ml-1">×</button>
            </Badge>
          ))}
        </div>
      </div>
      
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
      
      <div>
        <Label>Дата найма</Label>
        <Input 
          type="date"
          value={formData.hireDate.toISOString().split('T')[0]} 
          onChange={(e) => setFormData({...formData, hireDate: new Date(e.target.value)})} 
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
          <p className="text-muted-foreground">Управление сотрудниками и распределение задач</p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Icon name="UserCheck" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeTechnicians.length}</div>
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
                <div className="text-2xl font-bold">{technicians.filter(t => t.status === "busy").length}</div>
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
                <div className="text-2xl font-bold">{totalTasks}</div>
                <div className="text-xs text-muted-foreground">Выполнено</div>
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
                <div className="text-2xl font-bold">{avgRating}</div>
                <div className="text-xs text-muted-foreground">Средний рейтинг</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={technicians}
        columns={columns}
        filters={filters}
        searchKeys={['name', 'email', 'phone', 'specialization']}
        searchPlaceholder="Поиск по имени, email, специализации..."
        renderActions={(tech) => (
          <>
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
        emptyMessage="Нет техников в системе"
      />
    </div>
  );
};

export default TechniciansSection;
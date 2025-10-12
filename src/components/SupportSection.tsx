import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { supportService } from "@/services/supportService";
import { SupportTicket, Priority } from "@/types";

const SupportSection = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);

  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    subject: "",
    description: "",
    status: "open" as "open" | "in_progress" | "resolved" | "closed",
    priority: "medium" as Priority,
    assignedTo: ""
  });

  const openTickets = tickets.filter(t => t.status === "open").length;
  const inProgressTickets = tickets.filter(t => t.status === "in_progress").length;
  const resolvedToday = tickets.filter(t => {
    const today = new Date();
    return t.status === "resolved" && 
           t.updatedAt.toDateString() === today.toDateString();
  }).length;

  const handleCreate = () => {
    supportService.create(formData);
    setTickets(supportService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingTicket) return;
    supportService.update(editingTicket.id, formData);
    setTickets(supportService.getAll());
    setEditingTicket(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить тикет?")) {
      supportService.delete(id);
      setTickets(supportService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      userName: "",
      subject: "",
      description: "",
      status: "open",
      priority: "medium",
      assignedTo: ""
    });
  };

  const openEdit = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setFormData({
      userId: ticket.userId,
      userName: ticket.userName,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo || ""
    });
  };

  const getPriorityBadge = (priority: Priority) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "secondary",
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

  const getStatusBadge = (status: SupportTicket['status']) => {
    const variants = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "outline"
    };
    const labels = {
      open: "Открыт",
      in_progress: "В работе",
      resolved: "Решен",
      closed: "Закрыт"
    };
    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  const columns: Column<SupportTicket>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      render: (ticket) => (
        <Badge variant="outline" className="font-mono">{ticket.id}</Badge>
      ),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'subject', 
      label: 'Тема', 
      render: (ticket) => (
        <div>
          <div className="font-medium">{ticket.subject}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {ticket.userName}
            {ticket.assignedTo && ` • Назначен: ${ticket.assignedTo}`}
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'status', 
      label: 'Статус', 
      render: (ticket) => getStatusBadge(ticket.status),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'priority', 
      label: 'Приоритет', 
      render: (ticket) => getPriorityBadge(ticket.priority),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'createdAt', 
      label: 'Создан', 
      render: (ticket) => (
        <span className="text-sm text-muted-foreground">
          {ticket.createdAt.toLocaleDateString('ru-RU')}
        </span>
      ),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'updatedAt', 
      label: 'Обновлен', 
      render: (ticket) => (
        <span className="text-sm text-muted-foreground">
          {ticket.updatedAt.toLocaleDateString('ru-RU')}
        </span>
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
        { value: 'open', label: 'Открытые' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'resolved', label: 'Решенные' },
        { value: 'closed', label: 'Закрытые' }
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

  const TicketForm = () => (
    <div className="space-y-4">
      <div>
        <Label>ID пользователя</Label>
        <Input 
          value={formData.userId} 
          onChange={(e) => setFormData({...formData, userId: e.target.value})} 
          placeholder="USER-001" 
        />
      </div>
      
      <div>
        <Label>Имя пользователя</Label>
        <Input 
          value={formData.userName} 
          onChange={(e) => setFormData({...formData, userName: e.target.value})} 
          placeholder="Иван Иванов" 
        />
      </div>
      
      <div>
        <Label>Тема</Label>
        <Input 
          value={formData.subject} 
          onChange={(e) => setFormData({...formData, subject: e.target.value})} 
          placeholder="Опишите проблему кратко" 
        />
      </div>
      
      <div>
        <Label>Описание</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="Подробное описание проблемы..." 
          rows={4}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Статус</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val as any})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Открыт</SelectItem>
              <SelectItem value="in_progress">В работе</SelectItem>
              <SelectItem value="resolved">Решен</SelectItem>
              <SelectItem value="closed">Закрыт</SelectItem>
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
        <Label>Назначен на (опционально)</Label>
        <Input 
          value={formData.assignedTo} 
          onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} 
          placeholder="Имя сотрудника" 
        />
      </div>
      
      <Button onClick={editingTicket ? handleUpdate : handleCreate} className="w-full">
        {editingTicket ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Поддержка</h2>
          <p className="text-muted-foreground">Техническая поддержка и помощь</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetForm(); setEditingTicket(null); }}>
              <Icon name="Plus" className="h-4 w-4" />
              Новое обращение
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новое обращение</DialogTitle>
            </DialogHeader>
            <TicketForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Открытых тикетов</CardTitle>
            <Icon name="MessageSquare" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Требуют внимания</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Icon name="Clock" className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Ожидают ответа</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Решено сегодня</CardTitle>
            <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resolvedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Тикетов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
            <Icon name="FileText" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Зарегистрировано</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        filters={filters}
        searchKeys={['id', 'subject', 'userName', 'description', 'assignedTo']}
        searchPlaceholder="Поиск по ID, теме, пользователю..."
        renderActions={(ticket) => (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(ticket)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Редактировать тикет</DialogTitle>
                </DialogHeader>
                <TicketForm />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(ticket.id)}>
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </>
        )}
        emptyMessage="Нет обращений в поддержку"
      />

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

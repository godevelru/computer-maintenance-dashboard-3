import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { DataTable, Column } from "@/components/ui/data-table";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { clientService } from "@/services/clientService";
import { repairService } from "@/services/repairService";
import { Client } from "@/types";
import { toast } from "sonner";

const ClientsSection = () => {
  const [clients, setClients] = useState<Client[]>(clientService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'vip' | 'regular' | 'new'>('all');

  const repairs = repairService.getAll();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    company: "",
    taxId: "",
    discountPercent: 0
  });

  const handleCreate = () => {
    const newClient = clientService.create(formData);
    setClients(clientService.getAll());
    setIsCreateOpen(false);
    resetForm();
    toast.success('Клиент добавлен');
  };

  const handleUpdate = () => {
    if (!editingClient) return;
    clientService.update(editingClient.id, formData);
    setClients(clientService.getAll());
    setEditingClient(null);
    resetForm();
    toast.success('Клиент обновлен');
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить клиента? История заказов сохранится.")) {
      clientService.delete(id);
      setClients(clientService.getAll());
      toast.success('Клиент удален');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      company: "",
      taxId: "",
      discountPercent: 0
    });
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address || "",
      notes: client.notes || "",
      company: (client as any).company || "",
      taxId: (client as any).taxId || "",
      discountPercent: (client as any).discountPercent || 0
    });
  };

  const getClientSegment = (client: Client) => {
    if (client.totalSpent > 50000 || client.totalOrders > 10) return 'vip';
    if (client.totalOrders > 3) return 'regular';
    return 'new';
  };

  const getSegmentBadge = (segment: string) => {
    const config: any = {
      vip: { label: 'VIP', variant: 'default', icon: 'Crown' },
      regular: { label: 'Постоянный', variant: 'secondary', icon: 'Star' },
      new: { label: 'Новый', variant: 'outline', icon: 'User' }
    };
    const seg = config[segment];
    return (
      <Badge variant={seg.variant} className="gap-1">
        <Icon name={seg.icon} className="h-3 w-3" />
        {seg.label}
      </Badge>
    );
  };

  const clientsWithSegments = useMemo(() => {
    return clients.map(client => ({
      ...client,
      segment: getClientSegment(client),
      lastOrderDate: repairs
        .filter(r => r.clientId === client.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt,
      avgOrderValue: client.totalOrders > 0 ? Math.round(client.totalSpent / client.totalOrders) : 0
    }));
  }, [clients, repairs]);

  const filteredClients = useMemo(() => {
    if (segmentFilter === 'all') return clientsWithSegments;
    return clientsWithSegments.filter(c => c.segment === segmentFilter);
  }, [clientsWithSegments, segmentFilter]);

  const totalOrders = clients.reduce((sum, client) => sum + client.totalOrders, 0);
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const vipClients = clientsWithSegments.filter(c => c.segment === 'vip').length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const avgClientValue = clients.length > 0 ? Math.round(totalRevenue / clients.length) : 0;

  const topClients = [...clientsWithSegments]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const getClientRepairs = (clientId: string) => {
    return repairs
      .filter(r => r.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const columns: Column<any>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'name', 
      label: 'Клиент', 
      render: (client) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="User" className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{client.name}</div>
            <div className="text-xs text-muted-foreground">{client.email}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'phone', 
      label: 'Телефон', 
      render: (client) => (
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Phone" className="h-4 w-4 text-muted-foreground" />
          <span>{client.phone}</span>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'segment', 
      label: 'Сегмент', 
      render: (client) => getSegmentBadge(client.segment),
      sortable: true
    },
    { 
      key: 'totalOrders', 
      label: 'Заказов', 
      render: (client) => (
        <Badge variant="outline">{client.totalOrders}</Badge>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'avgOrderValue', 
      label: 'Ср. чек', 
      render: (client) => (
        <span className="font-medium text-sm">{client.avgOrderValue}₽</span>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'totalSpent', 
      label: 'Всего', 
      render: (client) => (
        <span className="font-medium">{client.totalSpent.toLocaleString()}₽</span>
      ),
      sortable: true,
      width: 'w-[120px]'
    }
  ];

  const ClientForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Имя / Название компании</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          placeholder="ООО Компания или Иван Иванов" 
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
        <Label>Адрес</Label>
        <Input 
          value={formData.address} 
          onChange={(e) => setFormData({...formData, address: e.target.value})} 
          placeholder="Москва, ул. Ленина, д. 1" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Компания (опционально)</Label>
          <Input 
            value={formData.company} 
            onChange={(e) => setFormData({...formData, company: e.target.value})} 
            placeholder="ООО Рога и Копыта" 
          />
        </div>
        <div>
          <Label>ИНН (опционально)</Label>
          <Input 
            value={formData.taxId} 
            onChange={(e) => setFormData({...formData, taxId: e.target.value})} 
            placeholder="1234567890" 
          />
        </div>
      </div>

      <div>
        <Label>Скидка (%)</Label>
        <Input 
          type="number"
          min="0"
          max="100"
          value={formData.discountPercent} 
          onChange={(e) => setFormData({...formData, discountPercent: Number(e.target.value)})} 
          placeholder="0" 
        />
      </div>
      
      <div>
        <Label>Примечания</Label>
        <Textarea 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          placeholder="Дополнительная информация о клиенте"
          rows={3}
        />
      </div>
      
      <Button onClick={editingClient ? handleUpdate : handleCreate} className="w-full">
        {editingClient ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Клиенты</h2>
          <p className="text-muted-foreground">База клиентов с полной аналитикой и историей</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>
            <Icon name={viewMode === 'table' ? 'Grid' : 'List'} className="h-4 w-4" />
          </Button>
          <ImportExportDialog
            data={clients}
            filename="clients"
            title="Клиенты"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Имя' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Телефон' },
              { key: 'address', label: 'Адрес' },
              { key: 'totalOrders', label: 'Заказов' },
              { key: 'totalSpent', label: 'Сумма' },
            ]}
            onImport={(data) => {
              toast.success(`Импортировано ${data.length} клиентов`);
            }}
          />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setEditingClient(null); }}>
                <Icon name="UserPlus" className="h-4 w-4" />
                Добавить клиента
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новый клиент</DialogTitle>
              </DialogHeader>
              <ClientForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего клиентов</CardTitle>
            <Icon name="Users" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">В базе данных</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">VIP клиенты</CardTitle>
            <Icon name="Crown" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vipClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Премиум сегмент</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
            <Icon name="ShoppingCart" className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">От всех клиентов</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ср. чек</CardTitle>
            <Icon name="TrendingUp" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{avgOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">На заказ</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LTV клиента</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{avgClientValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Средняя ценность</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Топ-5 клиентов</CardTitle>
              <Badge variant="secondary">По выручке</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{client.name}</span>
                      {getSegmentBadge(client.segment)}
                    </div>
                    <div className="text-sm text-muted-foreground">{client.totalOrders} заказов • ср. чек {client.avgOrderValue}₽</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₽{client.totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Общая выручка</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сегментация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Crown" className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">VIP клиенты</span>
                </div>
                <span className="font-medium">{clientsWithSegments.filter(c => c.segment === 'vip').length}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${(clientsWithSegments.filter(c => c.segment === 'vip').length / clients.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Star" className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Постоянные</span>
                </div>
                <span className="font-medium">{clientsWithSegments.filter(c => c.segment === 'regular').length}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(clientsWithSegments.filter(c => c.segment === 'regular').length / clients.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="User" className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Новые</span>
                </div>
                <span className="font-medium">{clientsWithSegments.filter(c => c.segment === 'new').length}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-500 transition-all"
                  style={{ width: `${(clientsWithSegments.filter(c => c.segment === 'new').length / clients.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">Фильтр по сегменту</div>
              <Select value={segmentFilter} onValueChange={(v: any) => setSegmentFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все клиенты</SelectItem>
                  <SelectItem value="vip">Только VIP</SelectItem>
                  <SelectItem value="regular">Только постоянные</SelectItem>
                  <SelectItem value="new">Только новые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={filteredClients}
        columns={columns}
        searchKeys={['id', 'name', 'email', 'phone', 'address']}
        searchPlaceholder="Поиск по имени, телефону, email..."
        renderActions={(client) => (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => setSelectedClient(client)}>
                  <Icon name="Eye" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>История клиента</DialogTitle>
                </DialogHeader>
                {selectedClient && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{selectedClient.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedClient.email} • {selectedClient.phone}</p>
                      </div>
                      {getSegmentBadge(selectedClient.segment)}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{selectedClient.totalOrders}</div>
                          <div className="text-xs text-muted-foreground">Заказов</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">₽{selectedClient.totalSpent.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Выручка</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">₽{selectedClient.avgOrderValue}</div>
                          <div className="text-xs text-muted-foreground">Ср. чек</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">История заказов</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {getClientRepairs(selectedClient.id).map(repair => (
                          <div key={repair.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                            <div className="flex items-center gap-3">
                              <Icon name="Monitor" className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">#{repair.id} • {repair.deviceModel}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(repair.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₽{repair.finalCost || repair.estimatedCost}</div>
                              <Badge variant={repair.status === 'completed' ? 'outline' : 'default'} className="text-xs">
                                {repair.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(client)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Редактировать клиента</DialogTitle>
                </DialogHeader>
                <ClientForm />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(client.id)}>
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </>
        )}
        emptyMessage="Нет клиентов в базе"
      />
    </div>
  );
};

export default ClientsSection;

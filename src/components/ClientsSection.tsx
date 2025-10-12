import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { clientService } from "@/services/clientService";
import { Client } from "@/types";

const ClientsSection = () => {
  const [clients, setClients] = useState<Client[]>(clientService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  const handleCreate = () => {
    const newClient = clientService.create(formData);
    setClients(clientService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingClient) return;
    clientService.update(editingClient.id, formData);
    setClients(clientService.getAll());
    setEditingClient(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить клиента?")) {
      clientService.delete(id);
      setClients(clientService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    });
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address || "",
      notes: client.notes || ""
    });
  };

  const totalOrders = clients.reduce((sum, client) => sum + client.totalOrders, 0);
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);

  const columns: Column<Client>[] = [
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
      key: 'address', 
      label: 'Адрес', 
      render: (client) => (
        <div className="flex items-center gap-2 text-sm">
          {client.address ? (
            <>
              <Icon name="MapPin" className="h-4 w-4 text-muted-foreground" />
              <span>{client.address}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
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
      key: 'totalSpent', 
      label: 'Сумма', 
      render: (client) => (
        <span className="font-medium">{client.totalSpent}₽</span>
      ),
      sortable: true,
      width: 'w-[120px]'
    }
  ];

  const ClientForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Имя</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          placeholder="ООО Компания или Иван Иванов" 
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
        <Label>Адрес</Label>
        <Input 
          value={formData.address} 
          onChange={(e) => setFormData({...formData, address: e.target.value})} 
          placeholder="Москва, ул. Ленина, д. 1" 
        />
      </div>
      
      <div>
        <Label>Примечания</Label>
        <Input 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
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
          <p className="text-muted-foreground">База данных клиентов и их заказов</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetForm(); setEditingClient(null); }}>
              <Icon name="UserPlus" className="h-4 w-4" />
              Добавить клиента
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый клиент</DialogTitle>
            </DialogHeader>
            <ClientForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего клиентов</CardTitle>
            <Icon name="Users" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">В базе данных</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
            <Icon name="ShoppingCart" className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">От всех клиентов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">За всё время</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={clients}
        columns={columns}
        searchKeys={['id', 'name', 'email', 'phone', 'address']}
        searchPlaceholder="Поиск по имени, телефону, email..."
        renderActions={(client) => (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(client)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
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

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { clientService } from "@/services/clientService";
import { Client } from "@/types";

const ClientsSection = () => {
  const [clients, setClients] = useState<Client[]>(clientService.getAll());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  const filteredClients = searchQuery === "" 
    ? clients 
    : clientService.search(searchQuery);

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

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Input 
              placeholder="Поиск по имени, телефону, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1" 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="User" className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <Badge variant="outline" className="mt-1">ID: {client.id}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Phone" className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Mail" className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                    {client.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="MapPin" className="h-4 w-4" />
                        <span>{client.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-xs text-muted-foreground">Заказов</div>
                      <div className="text-lg font-bold">{client.totalOrders}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Общая сумма</div>
                      <div className="text-lg font-bold">{client.totalSpent}₽</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openEdit(client)}>
                          <Icon name="Edit" className="h-4 w-4" />
                          Изменить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редактировать клиента</DialogTitle>
                        </DialogHeader>
                        <ClientForm />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(client.id)}
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </Button>
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

export default ClientsSection;

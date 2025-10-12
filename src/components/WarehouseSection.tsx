import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { warehouseService } from "@/services/warehouseService";
import { inventoryService } from "@/services/inventoryService";
import { WarehouseZone, StockMovement } from "@/types";

const WarehouseSection = () => {
  const [zones, setZones] = useState<WarehouseZone[]>(warehouseService.getAllZones());
  const [movements, setMovements] = useState<StockMovement[]>(warehouseService.getAllMovements());
  const [activeTab, setActiveTab] = useState<"movements" | "zones">("movements");
  const [isCreateMovementOpen, setIsCreateMovementOpen] = useState(false);
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<WarehouseZone | null>(null);

  const items = inventoryService.getAll();

  const [movementFormData, setMovementFormData] = useState({
    itemId: "",
    quantity: 0,
    type: "in" as "in" | "out",
    fromZone: "",
    toZone: "",
    reason: "",
    date: new Date()
  });

  const [zoneFormData, setZoneFormData] = useState({
    name: "",
    capacity: 0,
    currentLoad: 0,
    temperature: 0,
    humidity: 0
  });

  const totalItems = zones.reduce((sum, zone) => sum + zone.currentLoad, 0);
  const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
  const utilizationRate = totalCapacity > 0 ? Math.round((totalItems / totalCapacity) * 100) : 0;
  const inMovements = movements.filter(m => m.type === "in").length;
  const outMovements = movements.filter(m => m.type === "out").length;

  const handleCreateMovement = () => {
    const item = items.find(i => i.id === movementFormData.itemId);
    if (!item) return;

    warehouseService.createMovement({
      ...movementFormData,
      itemName: item.name
    });
    setMovements(warehouseService.getAllMovements());
    setIsCreateMovementOpen(false);
    resetMovementForm();
  };

  const handleCreateZone = () => {
    warehouseService.createZone(zoneFormData);
    setZones(warehouseService.getAllZones());
    setIsCreateZoneOpen(false);
    resetZoneForm();
  };

  const handleUpdateZone = () => {
    if (!editingZone) return;
    warehouseService.updateZone(editingZone.id, zoneFormData);
    setZones(warehouseService.getAllZones());
    setEditingZone(null);
    resetZoneForm();
  };

  const handleDeleteZone = (id: string) => {
    if (confirm("Удалить зону?")) {
      warehouseService.deleteZone(id);
      setZones(warehouseService.getAllZones());
    }
  };

  const resetMovementForm = () => {
    setMovementFormData({
      itemId: "",
      quantity: 0,
      type: "in",
      fromZone: "",
      toZone: "",
      reason: "",
      date: new Date()
    });
  };

  const resetZoneForm = () => {
    setZoneFormData({
      name: "",
      capacity: 0,
      currentLoad: 0,
      temperature: 0,
      humidity: 0
    });
  };

  const openEditZone = (zone: WarehouseZone) => {
    setEditingZone(zone);
    setZoneFormData({
      name: zone.name,
      capacity: zone.capacity,
      currentLoad: zone.currentLoad,
      temperature: zone.temperature || 0,
      humidity: zone.humidity || 0
    });
  };

  const MovementForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Тип операции</Label>
        <Select value={movementFormData.type} onValueChange={(val) => setMovementFormData({...movementFormData, type: val as "in" | "out"})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Приход</SelectItem>
            <SelectItem value="out">Расход</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Товар</Label>
        <Select value={movementFormData.itemId} onValueChange={(val) => setMovementFormData({...movementFormData, itemId: val})}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите товар" />
          </SelectTrigger>
          <SelectContent>
            {items.map(item => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Количество</Label>
        <Input 
          type="number"
          value={movementFormData.quantity} 
          onChange={(e) => setMovementFormData({...movementFormData, quantity: Number(e.target.value)})} 
        />
      </div>
      
      {movementFormData.type === "out" && (
        <div>
          <Label>Откуда</Label>
          <Select value={movementFormData.fromZone} onValueChange={(val) => setMovementFormData({...movementFormData, fromZone: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите зону" />
            </SelectTrigger>
            <SelectContent>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {movementFormData.type === "in" && (
        <div>
          <Label>Куда</Label>
          <Select value={movementFormData.toZone} onValueChange={(val) => setMovementFormData({...movementFormData, toZone: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите зону" />
            </SelectTrigger>
            <SelectContent>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label>Причина</Label>
        <Input 
          value={movementFormData.reason} 
          onChange={(e) => setMovementFormData({...movementFormData, reason: e.target.value})} 
          placeholder="Поступление от поставщика, выдача на ремонт..." 
        />
      </div>
      
      <div>
        <Label>Дата</Label>
        <Input 
          type="date"
          value={movementFormData.date.toISOString().split('T')[0]} 
          onChange={(e) => setMovementFormData({...movementFormData, date: new Date(e.target.value)})} 
        />
      </div>
      
      <Button onClick={handleCreateMovement} className="w-full">
        Создать
      </Button>
    </div>
  );

  const ZoneForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Название зоны</Label>
        <Input 
          value={zoneFormData.name} 
          onChange={(e) => setZoneFormData({...zoneFormData, name: e.target.value})} 
          placeholder="Зона А - Комплектующие" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Вместимость</Label>
          <Input 
            type="number"
            value={zoneFormData.capacity} 
            onChange={(e) => setZoneFormData({...zoneFormData, capacity: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Текущая загрузка</Label>
          <Input 
            type="number"
            value={zoneFormData.currentLoad} 
            onChange={(e) => setZoneFormData({...zoneFormData, currentLoad: Number(e.target.value)})} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Температура (°C)</Label>
          <Input 
            type="number"
            value={zoneFormData.temperature} 
            onChange={(e) => setZoneFormData({...zoneFormData, temperature: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Влажность (%)</Label>
          <Input 
            type="number"
            value={zoneFormData.humidity} 
            onChange={(e) => setZoneFormData({...zoneFormData, humidity: Number(e.target.value)})} 
          />
        </div>
      </div>
      
      <Button onClick={editingZone ? handleUpdateZone : handleCreateZone} className="w-full">
        {editingZone ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Склад</h2>
          <p className="text-muted-foreground">Учет движения товаров и управление складом</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateZoneOpen} onOpenChange={setIsCreateZoneOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => { resetZoneForm(); setEditingZone(null); }}>
                <Icon name="Package" className="h-4 w-4" />
                Создать зону
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая зона</DialogTitle>
              </DialogHeader>
              <ZoneForm />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateMovementOpen} onOpenChange={setIsCreateMovementOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetMovementForm}>
                <Icon name="Plus" className="h-4 w-4" />
                Приход/расход
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новое движение</DialogTitle>
              </DialogHeader>
              <MovementForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего позиций</CardTitle>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">На складе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Приход</CardTitle>
            <Icon name="ArrowDownLeft" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inMovements}</div>
            <p className="text-xs text-muted-foreground mt-1">Операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Расход</CardTitle>
            <Icon name="ArrowUpRight" className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outMovements}</div>
            <p className="text-xs text-muted-foreground mt-1">Операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Заполненность</CardTitle>
            <Icon name="BarChart3" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">От вместимости</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        <Button 
          variant={activeTab === "movements" ? "default" : "ghost"}
          onClick={() => setActiveTab("movements")}
        >
          Движения
        </Button>
        <Button 
          variant={activeTab === "zones" ? "default" : "ghost"}
          onClick={() => setActiveTab("zones")}
        >
          Зоны
        </Button>
      </div>

      {activeTab === "movements" && (
        <Card>
          <CardHeader>
            <CardTitle>Последние движения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      movement.type === 'in' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <Icon name={movement.type === 'in' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                            className={`h-5 w-5 ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium">{movement.itemName}</div>
                      <div className="text-sm text-muted-foreground">
                        {movement.reason}
                        {movement.fromZone && ` • Откуда: ${movement.fromZone}`}
                        {movement.toZone && ` • Куда: ${movement.toZone}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {movement.date.toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
              {movements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Нет движений товаров
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "zones" && (
        <Card>
          <CardHeader>
            <CardTitle>Складские зоны</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {zones.map((zone) => {
              const utilization = zone.capacity > 0 ? Math.round((zone.currentLoad / zone.capacity) * 100) : 0;
              return (
                <div key={zone.id} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {zone.currentLoad} из {zone.capacity} позиций
                        {zone.temperature && ` • ${zone.temperature}°C`}
                        {zone.humidity && ` • ${zone.humidity}% влажность`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{utilization}%</Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => openEditZone(zone)}>
                            <Icon name="Edit" className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Редактировать зону</DialogTitle>
                          </DialogHeader>
                          <ZoneForm />
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteZone(zone.id)}>
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${utilization > 70 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {zones.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Нет созданных зон
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WarehouseSection;

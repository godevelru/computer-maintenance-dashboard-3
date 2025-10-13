import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { warehouseService } from "@/services/warehouseService";
import { inventoryService } from "@/services/inventoryService";
import { WarehouseZone, StockMovement, InventoryItem } from "@/types";
import { toast } from "sonner";

const WarehouseSection = () => {
  const [zones, setZones] = useState<WarehouseZone[]>(warehouseService.getAllZones());
  const [movements, setMovements] = useState<StockMovement[]>(warehouseService.getAllMovements());
  const [activeTab, setActiveTab] = useState<"movements" | "zones" | "analytics">("movements");
  const [isCreateMovementOpen, setIsCreateMovementOpen] = useState(false);
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<WarehouseZone | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"" | "in" | "out">("");

  const items = inventoryService.getAll();

  const [movementFormData, setMovementFormData] = useState({
    itemId: "",
    quantity: 0,
    type: "in" as "in" | "out",
    fromZone: "",
    toZone: "",
    reason: "",
    date: new Date(),
    cost: 0,
    supplier: "",
    documentNumber: ""
  });

  const [zoneFormData, setZoneFormData] = useState({
    name: "",
    capacity: 0,
    currentLoad: 0,
    temperature: 20,
    humidity: 50,
    location: "",
    responsible: ""
  });

  const warehouseStats = useMemo(() => {
    const totalItems = zones.reduce((sum, zone) => sum + zone.currentLoad, 0);
    const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
    const utilizationRate = totalCapacity > 0 ? Math.round((totalItems / totalCapacity) * 100) : 0;
    
    const filteredMovements = movements.filter(m => {
      if (dateFilter) {
        const moveDate = m.date.toISOString().split('T')[0];
        if (moveDate !== dateFilter) return false;
      }
      if (typeFilter && m.type !== typeFilter) return false;
      return true;
    });

    const inMovements = filteredMovements.filter(m => m.type === "in");
    const outMovements = filteredMovements.filter(m => m.type === "out");
    
    const totalInQuantity = inMovements.reduce((sum, m) => sum + m.quantity, 0);
    const totalOutQuantity = outMovements.reduce((sum, m) => sum + m.quantity, 0);
    
    const totalInValue = inMovements.reduce((sum, m) => sum + (m.cost || 0) * m.quantity, 0);
    const totalOutValue = outMovements.reduce((sum, m) => sum + (m.cost || 0) * m.quantity, 0);

    const movementsByItem: { [key: string]: { in: number; out: number; name: string } } = {};
    movements.forEach(m => {
      if (!movementsByItem[m.itemId]) {
        movementsByItem[m.itemId] = { in: 0, out: 0, name: m.itemName };
      }
      if (m.type === 'in') {
        movementsByItem[m.itemId].in += m.quantity;
      } else {
        movementsByItem[m.itemId].out += m.quantity;
      }
    });

    const mostActiveItem = Object.entries(movementsByItem)
      .sort((a, b) => (b[1].in + b[1].out) - (a[1].in + a[1].out))[0];

    return {
      totalItems,
      totalCapacity,
      utilizationRate,
      inMovements: inMovements.length,
      outMovements: outMovements.length,
      totalInQuantity,
      totalOutQuantity,
      totalInValue,
      totalOutValue,
      mostActiveItem: mostActiveItem ? mostActiveItem[1].name : '-',
      filteredMovements
    };
  }, [zones, movements, dateFilter, typeFilter]);

  const handleCreateMovement = () => {
    const item = items.find(i => i.id === movementFormData.itemId);
    if (!item) {
      toast.error("Выберите товар");
      return;
    }

    if (movementFormData.quantity <= 0) {
      toast.error("Количество должно быть больше 0");
      return;
    }

    warehouseService.createMovement({
      ...movementFormData,
      itemName: item.name
    });

    if (movementFormData.type === "out") {
      inventoryService.update(item.id, {
        quantity: item.quantity - movementFormData.quantity
      });
    } else {
      inventoryService.update(item.id, {
        quantity: item.quantity + movementFormData.quantity
      });
    }

    setMovements(warehouseService.getAllMovements());
    setIsCreateMovementOpen(false);
    resetMovementForm();
    toast.success(`${movementFormData.type === 'in' ? 'Приход' : 'Расход'} зарегистрирован`);
  };

  const handleCreateZone = () => {
    if (!zoneFormData.name) {
      toast.error("Введите название зоны");
      return;
    }

    warehouseService.createZone(zoneFormData);
    setZones(warehouseService.getAllZones());
    setIsCreateZoneOpen(false);
    resetZoneForm();
    toast.success("Зона создана");
  };

  const handleUpdateZone = () => {
    if (!editingZone) return;
    warehouseService.updateZone(editingZone.id, zoneFormData);
    setZones(warehouseService.getAllZones());
    setEditingZone(null);
    resetZoneForm();
    toast.success("Зона обновлена");
  };

  const handleDeleteZone = (id: string) => {
    if (confirm("Удалить зону?")) {
      warehouseService.deleteZone(id);
      setZones(warehouseService.getAllZones());
      toast.success("Зона удалена");
    }
  };

  const handleDeleteMovement = (id: string) => {
    if (confirm("Удалить движение?")) {
      warehouseService.deleteMovement(id);
      setMovements(warehouseService.getAllMovements());
      toast.success("Движение удалено");
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
      date: new Date(),
      cost: 0,
      supplier: "",
      documentNumber: ""
    });
  };

  const resetZoneForm = () => {
    setZoneFormData({
      name: "",
      capacity: 0,
      currentLoad: 0,
      temperature: 20,
      humidity: 50,
      location: "",
      responsible: ""
    });
  };

  const openEditZone = (zone: WarehouseZone) => {
    setEditingZone(zone);
    setZoneFormData({
      name: zone.name,
      capacity: zone.capacity,
      currentLoad: zone.currentLoad,
      temperature: zone.temperature || 20,
      humidity: zone.humidity || 50,
      location: (zone as any).location || "",
      responsible: (zone as any).responsible || ""
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
            <SelectItem value="in">
              <div className="flex items-center gap-2">
                <Icon name="ArrowDownLeft" className="h-4 w-4 text-green-600" />
                Приход
              </div>
            </SelectItem>
            <SelectItem value="out">
              <div className="flex items-center gap-2">
                <Icon name="ArrowUpRight" className="h-4 w-4 text-red-600" />
                Расход
              </div>
            </SelectItem>
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
              <SelectItem key={item.id} value={item.id}>
                {item.name} (Остаток: {item.quantity} {item.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Количество</Label>
          <Input 
            type="number"
            min="1"
            value={movementFormData.quantity} 
            onChange={(e) => setMovementFormData({...movementFormData, quantity: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Цена за единицу</Label>
          <Input 
            type="number"
            min="0"
            value={movementFormData.cost} 
            onChange={(e) => setMovementFormData({...movementFormData, cost: Number(e.target.value)})} 
            placeholder="0"
          />
        </div>
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
        <>
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
          <div>
            <Label>Поставщик</Label>
            <Input 
              value={movementFormData.supplier} 
              onChange={(e) => setMovementFormData({...movementFormData, supplier: e.target.value})} 
              placeholder="Название поставщика" 
            />
          </div>
        </>
      )}
      
      <div>
        <Label>Номер документа</Label>
        <Input 
          value={movementFormData.documentNumber} 
          onChange={(e) => setMovementFormData({...movementFormData, documentNumber: e.target.value})} 
          placeholder="Накладная, счет..." 
        />
      </div>
      
      <div>
        <Label>Причина</Label>
        <Textarea 
          value={movementFormData.reason} 
          onChange={(e) => setMovementFormData({...movementFormData, reason: e.target.value})} 
          placeholder="Поступление от поставщика, выдача на ремонт..." 
          rows={3}
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

      {movementFormData.quantity > 0 && movementFormData.cost > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Общая сумма</div>
          <div className="text-2xl font-bold">
            ₽{(movementFormData.quantity * movementFormData.cost).toLocaleString()}
          </div>
        </div>
      )}
      
      <Button onClick={handleCreateMovement} className="w-full">
        {movementFormData.type === 'in' ? 'Оформить приход' : 'Оформить расход'}
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

      <div>
        <Label>Расположение</Label>
        <Input 
          value={zoneFormData.location} 
          onChange={(e) => setZoneFormData({...zoneFormData, location: e.target.value})} 
          placeholder="Склад 1, стеллаж 5" 
        />
      </div>

      <div>
        <Label>Ответственный</Label>
        <Input 
          value={zoneFormData.responsible} 
          onChange={(e) => setZoneFormData({...zoneFormData, responsible: e.target.value})} 
          placeholder="ФИО сотрудника" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Вместимость (единиц)</Label>
          <Input 
            type="number"
            min="0"
            value={zoneFormData.capacity} 
            onChange={(e) => setZoneFormData({...zoneFormData, capacity: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Текущая загрузка</Label>
          <Input 
            type="number"
            min="0"
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
            min="0"
            max="100"
            value={zoneFormData.humidity} 
            onChange={(e) => setZoneFormData({...zoneFormData, humidity: Number(e.target.value)})} 
          />
        </div>
      </div>
      
      <Button onClick={editingZone ? handleUpdateZone : handleCreateZone} className="w-full">
        {editingZone ? "Сохранить изменения" : "Создать зону"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Склад</h2>
          <p className="text-muted-foreground">Учет движения товаров и управление складскими зонами</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateZoneOpen} onOpenChange={setIsCreateZoneOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => { resetZoneForm(); setEditingZone(null); }}>
                <Icon name="Package" className="h-4 w-4" />
                Создать зону
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая складская зона</DialogTitle>
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
                <DialogTitle>Новое движение товара</DialogTitle>
              </DialogHeader>
              <MovementForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">На складе</CardTitle>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{warehouseStats.totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">из {warehouseStats.totalCapacity} возможных</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Приход</CardTitle>
            <Icon name="ArrowDownLeft" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+{warehouseStats.totalInQuantity}</div>
            <p className="text-xs text-muted-foreground mt-1">{warehouseStats.inMovements} операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Расход</CardTitle>
            <Icon name="ArrowUpRight" className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">-{warehouseStats.totalOutQuantity}</div>
            <p className="text-xs text-muted-foreground mt-1">{warehouseStats.outMovements} операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Заполненность</CardTitle>
            <Icon name="BarChart3" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{warehouseStats.utilizationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Загрузка склада</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        <Button 
          variant={activeTab === "movements" ? "default" : "ghost"}
          onClick={() => setActiveTab("movements")}
        >
          <Icon name="TrendingUp" className="h-4 w-4 mr-2" />
          Движения
        </Button>
        <Button 
          variant={activeTab === "zones" ? "default" : "ghost"}
          onClick={() => setActiveTab("zones")}
        >
          <Icon name="Grid3x3" className="h-4 w-4 mr-2" />
          Зоны
        </Button>
        <Button 
          variant={activeTab === "analytics" ? "default" : "ghost"}
          onClick={() => setActiveTab("analytics")}
        >
          <Icon name="PieChart" className="h-4 w-4 mr-2" />
          Аналитика
        </Button>
      </div>

      {activeTab === "movements" && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Фильтр по дате</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Все даты"
              />
            </div>
            <div className="flex-1">
              <Label>Тип операции</Label>
              <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все операции" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все операции</SelectItem>
                  <SelectItem value="in">Только приход</SelectItem>
                  <SelectItem value="out">Только расход</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(dateFilter || typeFilter) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFilter("");
                    setTypeFilter("");
                  }}
                >
                  <Icon name="X" className="h-4 w-4 mr-2" />
                  Сбросить
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>История движений</CardTitle>
              <CardDescription>
                Показано {warehouseStats.filteredMovements.length} из {movements.length} операций
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warehouseStats.filteredMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        movement.type === 'in' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        <Icon name={movement.type === 'in' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                              className={`h-6 w-6 ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">{movement.itemName}</div>
                          <Badge variant={movement.type === 'in' ? 'outline' : 'secondary'}>
                            {movement.type === 'in' ? 'Приход' : 'Расход'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {movement.reason}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                          {movement.fromZone && <span>Откуда: {zones.find(z => z.id === movement.fromZone)?.name || movement.fromZone}</span>}
                          {movement.toZone && <span>Куда: {zones.find(z => z.id === movement.toZone)?.name || movement.toZone}</span>}
                          {(movement as any).documentNumber && <span>№ {(movement as any).documentNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </div>
                      {movement.cost && movement.cost > 0 && (
                        <div className="text-sm text-muted-foreground">
                          ₽{(movement.quantity * movement.cost).toLocaleString()}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {movement.date.toLocaleDateString('ru-RU')}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => handleDeleteMovement(movement.id)}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {warehouseStats.filteredMovements.length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="Package" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет движений товаров</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "zones" && (
        <Card>
          <CardHeader>
            <CardTitle>Складские зоны</CardTitle>
            <CardDescription>Всего {zones.length} зон</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {zones.map((zone) => {
              const utilization = zone.capacity > 0 ? Math.round((zone.currentLoad / zone.capacity) * 100) : 0;
              return (
                <div key={zone.id} className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-lg">{zone.name}</div>
                        <Badge variant={utilization > 80 ? 'destructive' : utilization > 60 ? 'default' : 'outline'}>
                          {utilization}% заполнено
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Icon name="Package" className="h-4 w-4" />
                          {zone.currentLoad} из {zone.capacity} позиций
                        </div>
                        {zone.temperature && (
                          <div className="flex items-center gap-2">
                            <Icon name="Thermometer" className="h-4 w-4" />
                            {zone.temperature}°C
                          </div>
                        )}
                        {zone.humidity && (
                          <div className="flex items-center gap-2">
                            <Icon name="Droplet" className="h-4 w-4" />
                            {zone.humidity}% влажность
                          </div>
                        )}
                        {(zone as any).location && (
                          <div className="flex items-center gap-2">
                            <Icon name="MapPin" className="h-4 w-4" />
                            {(zone as any).location}
                          </div>
                        )}
                        {(zone as any).responsible && (
                          <div className="flex items-center gap-2">
                            <Icon name="User" className="h-4 w-4" />
                            {(zone as any).responsible}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => openEditZone(zone)}>
                            <Icon name="Edit" className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Редактировать зону</DialogTitle>
                          </DialogHeader>
                          <ZoneForm />
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteZone(zone.id)}>
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Загрузка</span>
                      <span>{zone.currentLoad} / {zone.capacity}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          utilization > 80 ? 'bg-red-500' : 
                          utilization > 60 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {zones.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Grid3x3" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Нет созданных зон</p>
                <Button onClick={() => setIsCreateZoneOpen(true)}>
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Создать первую зону
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Финансовая сводка</CardTitle>
              <CardDescription>По всем движениям товаров</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Общий приход</div>
                  <div className="text-2xl font-bold text-green-600">₽{warehouseStats.totalInValue.toLocaleString()}</div>
                </div>
                <Icon name="TrendingUp" className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Общий расход</div>
                  <div className="text-2xl font-bold text-red-600">₽{warehouseStats.totalOutValue.toLocaleString()}</div>
                </div>
                <Icon name="TrendingDown" className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Баланс</div>
                  <div className="text-2xl font-bold">
                    ₽{(warehouseStats.totalInValue - warehouseStats.totalOutValue).toLocaleString()}
                  </div>
                </div>
                <Icon name="DollarSign" className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статистика операций</CardTitle>
              <CardDescription>Общие показатели</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Всего операций</span>
                  <span className="font-medium">{movements.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Приход</span>
                  <span className="font-medium text-green-600">{warehouseStats.inMovements}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Расход</span>
                  <span className="font-medium text-red-600">{warehouseStats.outMovements}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Самый активный товар</span>
                  <span className="font-medium">{warehouseStats.mostActiveItem}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Складских зон</span>
                  <span className="font-medium">{zones.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Средняя загрузка зон</span>
                  <span className="font-medium">{warehouseStats.utilizationRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WarehouseSection;

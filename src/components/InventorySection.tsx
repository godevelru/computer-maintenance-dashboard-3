import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { inventoryService } from "@/services/inventoryService";
import { InventoryItem } from "@/types";
import { toast } from "sonner";

const InventorySection = () => {
  const [items, setItems] = useState<InventoryItem[]>(inventoryService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'low' | 'out'>('all');

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sku: "",
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 100,
    price: 0,
    costPrice: 0,
    supplier: "",
    location: "",
    description: "",
    unit: "шт"
  });

  const stats = useMemo(() => {
    const lowStock = items.filter(item => item.quantity > 0 && item.quantity <= item.minQuantity);
    const outOfStock = items.filter(item => item.quantity === 0);
    const inStock = items.filter(item => item.quantity > item.minQuantity);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCostValue = items.reduce((sum, item) => sum + ((item as any).costPrice || item.price) * item.quantity, 0);
    const potentialProfit = totalValue - totalCostValue;
    
    const categoryStats = items.reduce((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) {
        acc[cat] = { count: 0, value: 0, quantity: 0 };
      }
      acc[cat].count++;
      acc[cat].value += item.price * item.quantity;
      acc[cat].quantity += item.quantity;
      return acc;
    }, {} as Record<string, { count: number; value: number; quantity: number }>);

    return {
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      inStock: inStock.length,
      totalValue,
      potentialProfit,
      categoryStats,
      criticalItems: lowStock.length + outOfStock.length
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    switch(viewMode) {
      case 'low':
        return items.filter(item => item.quantity > 0 && item.quantity <= item.minQuantity);
      case 'out':
        return items.filter(item => item.quantity === 0);
      default:
        return items;
    }
  }, [items, viewMode]);

  const categories = [...new Set(items.map(item => item.category))];
  const suppliers = [...new Set(items.map(item => item.supplier).filter(Boolean))];

  const handleCreate = () => {
    inventoryService.create({
      ...formData,
      lastRestocked: new Date()
    });
    setItems(inventoryService.getAll());
    setIsCreateOpen(false);
    resetForm();
    toast.success('Позиция добавлена');
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    inventoryService.update(editingItem.id, formData);
    setItems(inventoryService.getAll());
    setEditingItem(null);
    resetForm();
    toast.success('Позиция обновлена');
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить позицию из инвентаря?")) {
      inventoryService.delete(id);
      setItems(inventoryService.getAll());
      toast.success('Позиция удалена');
    }
  };

  const handleQuickRestock = (item: InventoryItem) => {
    const toAdd = prompt(`Добавить к остатку "${item.name}". Текущий остаток: ${item.quantity} шт.`, "10");
    if (toAdd && !isNaN(Number(toAdd))) {
      inventoryService.update(item.id, { 
        quantity: item.quantity + Number(toAdd),
        lastRestocked: new Date()
      });
      setItems(inventoryService.getAll());
      toast.success(`Добавлено ${toAdd} шт.`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      sku: "",
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 100,
      price: 0,
      costPrice: 0,
      supplier: "",
      location: "",
      description: "",
      unit: "шт"
    });
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      sku: item.sku,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      maxQuantity: (item as any).maxQuantity || 100,
      price: item.price,
      costPrice: (item as any).costPrice || item.price,
      supplier: item.supplier || "",
      location: item.location || "",
      description: (item as any).description || "",
      unit: (item as any).unit || "шт"
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.quantity / item.minQuantity) * 100;
    if (item.quantity === 0) return { 
      variant: "destructive" as const, 
      label: "Отсутствует", 
      color: "bg-red-500",
      percentage: 0
    };
    if (item.quantity <= item.minQuantity) return { 
      variant: "secondary" as const, 
      label: "Низкий остаток", 
      color: "bg-yellow-500",
      percentage: Math.min(percentage, 100)
    };
    return { 
      variant: "outline" as const, 
      label: "В наличии", 
      color: "bg-green-500",
      percentage: 100
    };
  };

  const columns: Column<InventoryItem>[] = [
    { 
      key: 'name', 
      label: 'Наименование', 
      render: (item) => {
        const status = getStockStatus(item);
        return (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${status.color}/10 flex items-center justify-center`}>
              <Icon name="Package" className={`h-5 w-5 ${status.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.sku}</div>
            </div>
          </div>
        );
      },
      sortable: true
    },
    { 
      key: 'category', 
      label: 'Категория', 
      render: (item) => (
        <Badge variant="outline">{item.category}</Badge>
      ),
      sortable: true
    },
    { 
      key: 'quantity', 
      label: 'Остаток', 
      render: (item) => {
        const status = getStockStatus(item);
        return (
          <div className="space-y-1">
            <div className={`font-medium ${item.quantity <= item.minQuantity ? 'text-red-600' : ''}`}>
              {item.quantity} {(item as any).unit || 'шт'}
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-20">
              <div 
                className={`h-full ${status.color} transition-all`}
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>
        );
      },
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'minQuantity', 
      label: 'Мин/Макс', 
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.minQuantity} / {(item as any).maxQuantity || '∞'}
        </span>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'price', 
      label: 'Цена', 
      render: (item) => {
        const costPrice = (item as any).costPrice || item.price;
        const margin = item.price - costPrice;
        const marginPercent = costPrice > 0 ? ((margin / costPrice) * 100).toFixed(0) : 0;
        return (
          <div>
            <div className="font-medium">₽{item.price}</div>
            <div className="text-xs text-green-600">+{marginPercent}%</div>
          </div>
        );
      },
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'supplier', 
      label: 'Поставщик', 
      render: (item) => (
        <span className="text-sm">{item.supplier || '—'}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Статус', 
      render: (item) => {
        const status = getStockStatus(item);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
      width: 'w-[140px]'
    }
  ];

  const filters: Filter[] = [
    {
      key: 'category',
      label: 'Категория',
      options: categories.map(cat => ({ value: cat, label: cat }))
    },
    {
      key: 'supplier',
      label: 'Поставщик',
      options: suppliers.map(sup => ({ value: sup || '', label: sup || 'Без поставщика' }))
    }
  ];

  const ItemForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Наименование</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          placeholder="Термопаста Arctic MX-4" 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Категория</Label>
          <Input 
            list="categories"
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            placeholder="Расходники" 
          />
          <datalist id="categories">
            {categories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
        </div>
        <div>
          <Label>SKU/Артикул</Label>
          <Input 
            value={formData.sku} 
            onChange={(e) => setFormData({...formData, sku: e.target.value})} 
            placeholder="MX4-2019" 
          />
        </div>
        <div>
          <Label>Единица</Label>
          <Input 
            value={formData.unit} 
            onChange={(e) => setFormData({...formData, unit: e.target.value})} 
            placeholder="шт, кг, м" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Количество</Label>
          <Input 
            type="number" 
            value={formData.quantity} 
            onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Мин. остаток</Label>
          <Input 
            type="number" 
            value={formData.minQuantity} 
            onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})} 
          />
        </div>
        <div>
          <Label>Макс. остаток</Label>
          <Input 
            type="number" 
            value={formData.maxQuantity} 
            onChange={(e) => setFormData({...formData, maxQuantity: Number(e.target.value)})} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Цена продажи (₽)</Label>
          <Input 
            type="number" 
            value={formData.price} 
            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
            placeholder="450" 
          />
        </div>
        <div>
          <Label>Себестоимость (₽)</Label>
          <Input 
            type="number" 
            value={formData.costPrice} 
            onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} 
            placeholder="300" 
          />
        </div>
      </div>
      
      <div>
        <Label>Поставщик</Label>
        <Input 
          list="suppliers"
          value={formData.supplier} 
          onChange={(e) => setFormData({...formData, supplier: e.target.value})} 
          placeholder="ООО ТехСнаб" 
        />
        <datalist id="suppliers">
          {suppliers.map(sup => <option key={sup} value={sup} />)}
        </datalist>
      </div>
      
      <div>
        <Label>Местоположение</Label>
        <Input 
          value={formData.location} 
          onChange={(e) => setFormData({...formData, location: e.target.value})} 
          placeholder="Склад, Зона А, Полка 3" 
        />
      </div>

      <div>
        <Label>Описание</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="Дополнительная информация о товаре"
          rows={3}
        />
      </div>
      
      <Button onClick={editingItem ? handleUpdate : handleCreate} className="w-full">
        {editingItem ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Инвентарь</h2>
          <p className="text-muted-foreground">Умное управление складом с аналитикой</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="low" className="gap-1">
                Низкий
                {stats.lowStock > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {stats.lowStock}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="out" className="gap-1">
                Нет
                {stats.outOfStock > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {stats.outOfStock}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ImportExportDialog
            data={items}
            filename="inventory"
            title="Инвентарь"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Наименование' },
              { key: 'category', label: 'Категория' },
              { key: 'sku', label: 'SKU' },
              { key: 'quantity', label: 'Количество' },
              { key: 'minQuantity', label: 'Мин. количество' },
              { key: 'price', label: 'Цена' },
              { key: 'supplier', label: 'Поставщик' },
              { key: 'location', label: 'Местоположение' },
            ]}
            onImport={(data) => {
              toast.success(`Импортировано ${data.length} позиций`);
            }}
          />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setEditingItem(null); }}>
                <Icon name="Plus" className="h-4 w-4" />
                Добавить позицию
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая позиция</DialogTitle>
              </DialogHeader>
              <ItemForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего позиций</CardTitle>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">На складе</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-yellow-500/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Требуют заказа</CardTitle>
            <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.criticalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Критические остатки</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">В наличии</CardTitle>
            <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Позиций в норме</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Стоимость склада</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Общая стоимость</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Потенциал</CardTitle>
            <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₽{stats.potentialProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Потенциальная прибыль</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Критические остатки</CardTitle>
            <CardDescription>Требуют срочного пополнения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {items
                .filter(item => item.quantity <= item.minQuantity)
                .sort((a, b) => a.quantity - b.quantity)
                .slice(0, 10)
                .map(item => {
                  const status = getStockStatus(item);
                  const toOrder = Math.max(item.minQuantity * 2 - item.quantity, 0);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-lg ${status.color}/10 flex items-center justify-center flex-shrink-0`}>
                          <Icon name="Package" className={`h-5 w-5 ${status.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Остаток: {item.quantity} {(item as any).unit || 'шт'} / Мин: {item.minQuantity}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <div className="text-sm font-medium">Заказать: {toOrder}</div>
                          <div className="text-xs text-muted-foreground">≈ ₽{(toOrder * item.price).toLocaleString()}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleQuickRestock(item)}>
                          <Icon name="Plus" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>По категориям</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.categoryStats)
              .sort((a, b) => b[1].value - a[1].value)
              .slice(0, 6)
              .map(([category, data]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{category}</span>
                    <Badge variant="outline">{data.count}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{data.quantity} ед.</span>
                    <span className="font-medium">₽{data.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(data.value / stats.totalValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={filteredItems}
        columns={columns}
        filters={filters}
        searchKeys={['name', 'sku', 'category', 'supplier']}
        searchPlaceholder="Поиск по названию, артикулу, категории..."
        renderActions={(item) => (
          <>
            <Button size="sm" variant="ghost" onClick={() => handleQuickRestock(item)} title="Быстрое пополнение">
              <Icon name="Plus" className="h-4 w-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Редактировать позицию</DialogTitle>
                </DialogHeader>
                <ItemForm />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </>
        )}
        emptyMessage={
          viewMode === 'low' ? "Нет товаров с низким остатком" :
          viewMode === 'out' ? "Нет товаров, закончившихся на складе" :
          "Нет товаров на складе"
        }
      />
    </div>
  );
};

export default InventorySection;

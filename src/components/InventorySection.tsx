import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sku: "",
    quantity: 0,
    minQuantity: 0,
    price: 0,
    supplier: "",
    location: ""
  });

  const lowStockItems = items.filter(item => item.quantity <= item.minQuantity);
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const categories = [...new Set(items.map(item => item.category))];

  const handleCreate = () => {
    inventoryService.create({
      ...formData,
      lastRestocked: new Date()
    });
    setItems(inventoryService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    inventoryService.update(editingItem.id, formData);
    setItems(inventoryService.getAll());
    setEditingItem(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить позицию?")) {
      inventoryService.delete(id);
      setItems(inventoryService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      sku: "",
      quantity: 0,
      minQuantity: 0,
      price: 0,
      supplier: "",
      location: ""
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
      price: item.price,
      supplier: item.supplier || "",
      location: item.location || ""
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { variant: "destructive" as const, label: "Отсутствует" };
    if (item.quantity <= item.minQuantity) return { variant: "secondary" as const, label: "Низкий остаток" };
    return { variant: "outline" as const, label: "В наличии" };
  };

  const columns: Column<InventoryItem>[] = [
    { 
      key: 'name', 
      label: 'Наименование', 
      render: (item) => (
        <div className="flex items-center gap-2">
          <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.name}</span>
        </div>
      ),
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
      key: 'sku', 
      label: 'SKU', 
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.sku}</span>
      ),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'quantity', 
      label: 'Остаток', 
      render: (item) => (
        <span className={`font-medium ${item.quantity <= item.minQuantity ? 'text-red-600' : ''}`}>
          {item.quantity} шт.
        </span>
      ),
      sortable: true,
      width: 'w-[100px]'
    },
    { 
      key: 'minQuantity', 
      label: 'Мин. остаток', 
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.minQuantity} шт.</span>
      ),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'price', 
      label: 'Цена', 
      render: (item) => (
        <span className="font-medium">₽{item.price}</span>
      ),
      sortable: true,
      width: 'w-[100px]'
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Категория</Label>
          <Input 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            placeholder="Расходники" 
          />
        </div>
        <div>
          <Label>SKU/Артикул</Label>
          <Input 
            value={formData.sku} 
            onChange={(e) => setFormData({...formData, sku: e.target.value})} 
            placeholder="MX4-2019" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
      </div>
      
      <div>
        <Label>Цена</Label>
        <Input 
          type="number" 
          value={formData.price} 
          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
          placeholder="450" 
        />
      </div>
      
      <div>
        <Label>Поставщик</Label>
        <Input 
          value={formData.supplier} 
          onChange={(e) => setFormData({...formData, supplier: e.target.value})} 
          placeholder="ООО ТехСнаб" 
        />
      </div>
      
      <div>
        <Label>Местоположение</Label>
        <Input 
          value={formData.location} 
          onChange={(e) => setFormData({...formData, location: e.target.value})} 
          placeholder="Склад, Зона А, Полка 3" 
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
          <p className="text-muted-foreground">Управление запчастями и расходниками</p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего позиций</CardTitle>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">На складе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Низкий остаток</CardTitle>
            <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Требуют заказа</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">На складе</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={items}
        columns={columns}
        filters={filters}
        searchKeys={['name', 'sku', 'category', 'supplier']}
        searchPlaceholder="Поиск по названию, артикулу, категории..."
        renderActions={(item) => (
          <>
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
        emptyMessage="Нет товаров на складе"
      />
    </div>
  );
};

export default InventorySection;
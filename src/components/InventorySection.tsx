import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const InventorySection = () => {
  const inventory = [
    { id: 1, name: "Термопаста Arctic MX-4", category: "Расходники", stock: 45, minStock: 10, price: "₽450", status: "in-stock" },
    { id: 2, name: "SSD Samsung 970 EVO 500GB", category: "Комплектующие", stock: 8, minStock: 5, price: "₽5,990", status: "in-stock" },
    { id: 3, name: "Оперативная память DDR4 8GB", category: "Комплектующие", stock: 3, minStock: 5, price: "₽2,890", status: "low-stock" },
    { id: 4, name: "Блок питания 500W", category: "Комплектующие", stock: 12, minStock: 3, price: "₽3,490", status: "in-stock" },
    { id: 5, name: "Матрица 15.6\" Full HD", category: "Запчасти", stock: 0, minStock: 2, price: "₽4,500", status: "out-of-stock" },
    { id: 6, name: "Клавиатура для ноутбука ASUS", category: "Запчасти", stock: 6, minStock: 3, price: "₽1,290", status: "in-stock" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Инвентарь</h2>
          <p className="text-muted-foreground">Управление запчастями и расходниками</p>
        </div>
        <Button className="gap-2">
          <Icon name="Plus" className="h-4 w-4" />
          Добавить позицию
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего позиций</CardTitle>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">74</div>
            <p className="text-xs text-muted-foreground mt-1">6 категорий</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Низкий остаток</CardTitle>
            <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Требуют заказа</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽1.2M</div>
            <p className="text-xs text-muted-foreground mt-1">На складе</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Input placeholder="Поиск по названию, артикулу..." className="flex-1" />
            <Button variant="outline" className="gap-2">
              <Icon name="Filter" className="h-4 w-4" />
              Фильтры
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Наименование</th>
                  <th className="p-3 text-left font-medium">Категория</th>
                  <th className="p-3 text-left font-medium">Остаток</th>
                  <th className="p-3 text-left font-medium">Мин. остаток</th>
                  <th className="p-3 text-left font-medium">Цена</th>
                  <th className="p-3 text-left font-medium">Статус</th>
                  <th className="p-3 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{item.category}</td>
                    <td className="p-3">
                      <span className={`font-medium ${item.stock <= item.minStock ? 'text-red-600' : ''}`}>
                        {item.stock} шт.
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.minStock} шт.</td>
                    <td className="p-3 font-medium">{item.price}</td>
                    <td className="p-3">
                      <Badge variant={
                        item.status === 'in-stock' ? 'outline' :
                        item.status === 'low-stock' ? 'secondary' : 'destructive'
                      }>
                        {item.status === 'in-stock' ? 'В наличии' :
                         item.status === 'low-stock' ? 'Низкий остаток' : 'Отсутствует'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Icon name="ShoppingCart" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventorySection;

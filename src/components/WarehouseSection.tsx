import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const WarehouseSection = () => {
  const movements = [
    { id: 1, type: "in", item: "SSD Samsung 970 EVO", qty: 10, supplier: "ООО ТехСнаб", date: "12.10.2025", user: "Иванов А." },
    { id: 2, type: "out", item: "Термопаста Arctic MX-4", qty: 2, order: "#49567", date: "12.10.2025", user: "Петров В." },
    { id: 3, type: "in", item: "Блок питания 500W", qty: 5, supplier: "ИП Электрон", date: "11.10.2025", user: "Сидоров К." },
    { id: 4, type: "out", item: "Оперативная память DDR4", qty: 1, order: "#49565", date: "11.10.2025", user: "Иванов А." },
  ];

  const zones = [
    { name: "Зона А - Комплектующие", items: 45, capacity: 100, utilization: 45 },
    { name: "Зона Б - Запчасти", items: 78, capacity: 150, utilization: 52 },
    { name: "Зона В - Расходники", items: 124, capacity: 200, utilization: 62 },
    { name: "Зона Г - Периферия", items: 32, capacity: 80, utilization: 40 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Склад</h2>
          <p className="text-muted-foreground">Учет движения товаров и управление складом</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Icon name="Download" className="h-4 w-4" />
            Инвентаризация
          </Button>
          <Button className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Приход/расход
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего позиций</CardTitle>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">279</div>
            <p className="text-xs text-muted-foreground mt-1">На складе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Приход за месяц</CardTitle>
            <Icon name="ArrowDownLeft" className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">Операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Расход за месяц</CardTitle>
            <Icon name="ArrowUpRight" className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98</div>
            <p className="text-xs text-muted-foreground mt-1">Операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Заполненность</CardTitle>
            <Icon name="BarChart3" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">52%</div>
            <p className="text-xs text-muted-foreground mt-1">От вместимости</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                      <div className="font-medium">{movement.item}</div>
                      <div className="text-sm text-muted-foreground">
                        {movement.type === 'in' ? movement.supplier : movement.order} • {movement.user}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.qty}
                    </div>
                    <div className="text-xs text-muted-foreground">{movement.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Складские зоны</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {zones.map((zone, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{zone.name}</div>
                    <div className="text-sm text-muted-foreground">{zone.items} из {zone.capacity} позиций</div>
                  </div>
                  <Badge variant="outline">{zone.utilization}%</Badge>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${zone.utilization > 70 ? 'bg-red-500' : zone.utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${zone.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Поиск на складе</CardTitle>
            <Button variant="outline" className="gap-2">
              <Icon name="Search" className="h-4 w-4" />
              Расширенный поиск
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Input placeholder="Введите название товара, артикул или местоположение..." />
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseSection;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const FinanceSection = () => {
  const transactions = [
    { id: 1, type: "income", amount: "₽12,500", client: "ООО Техносервис", service: "Ремонт ноутбука", date: "12.10.2025", status: "paid" },
    { id: 2, type: "income", amount: "₽8,900", client: "ИП Смирнов", service: "Замена SSD", date: "12.10.2025", status: "paid" },
    { id: 3, type: "expense", amount: "₽15,000", supplier: "ООО ТехСнаб", item: "Закуп комплектующих", date: "11.10.2025", status: "paid" },
    { id: 4, type: "income", amount: "₽5,400", client: "Частное лицо", service: "Чистка ПК", date: "11.10.2025", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Финансы</h2>
          <p className="text-muted-foreground">Учет доходов и расходов</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Icon name="Download" className="h-4 w-4" />
            Отчет
          </Button>
          <Button className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Новая операция
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Доход за месяц</CardTitle>
            <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₽285,400</div>
            <p className="text-xs text-muted-foreground mt-1">+18% к прошлому</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Расходы за месяц</CardTitle>
            <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₽142,800</div>
            <p className="text-xs text-muted-foreground mt-1">Запчасти и расходники</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Чистая прибыль</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽142,600</div>
            <p className="text-xs text-muted-foreground mt-1">Маржа 50%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ожидают оплаты</CardTitle>
            <Icon name="Clock" className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽23,400</div>
            <p className="text-xs text-muted-foreground mt-1">5 заявок</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <Icon name={transaction.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                          className={`h-5 w-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <div className="font-medium">
                      {transaction.type === 'income' ? transaction.client : transaction.supplier}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.type === 'income' ? transaction.service : transaction.item}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">{transaction.date}</div>
                  </div>
                  <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
                    {transaction.status === 'paid' ? 'Оплачено' : 'Ожидание'}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Icon name="Eye" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSection;

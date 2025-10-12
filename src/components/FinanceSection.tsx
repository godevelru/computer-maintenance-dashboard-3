import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { financeService } from "@/services/financeService";
import { Transaction, TransactionType } from "@/types";

const FinanceSection = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(financeService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    type: "income" as TransactionType,
    category: "",
    amount: 0,
    description: "",
    date: new Date(),
    relatedRepairId: "",
    paymentMethod: ""
  });

  const totalIncome = financeService.getTotalIncome();
  const totalExpense = financeService.getTotalExpense();
  const balance = financeService.getBalance();

  const handleCreate = () => {
    financeService.create(formData);
    setTransactions(financeService.getAll());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingTransaction) return;
    financeService.update(editingTransaction.id, formData);
    setTransactions(financeService.getAll());
    setEditingTransaction(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить операцию?")) {
      financeService.delete(id);
      setTransactions(financeService.getAll());
    }
  };

  const resetForm = () => {
    setFormData({
      type: "income",
      category: "",
      amount: 0,
      description: "",
      date: new Date(),
      relatedRepairId: "",
      paymentMethod: ""
    });
  };

  const openEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      relatedRepairId: transaction.relatedRepairId || "",
      paymentMethod: transaction.paymentMethod || ""
    });
  };

  const columns: Column<Transaction>[] = [
    { 
      key: 'date', 
      label: 'Дата', 
      render: (transaction) => (
        <span className="text-sm">{transaction.date.toLocaleDateString('ru-RU')}</span>
      ),
      sortable: true,
      width: 'w-[120px]'
    },
    { 
      key: 'type', 
      label: 'Тип', 
      render: (transaction) => (
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
          }`}>
            <Icon name={transaction.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                  className={`h-4 w-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <Badge variant={transaction.type === 'income' ? 'outline' : 'secondary'}>
            {transaction.type === 'income' ? 'Доход' : 'Расход'}
          </Badge>
        </div>
      ),
      sortable: true,
      width: 'w-[140px]'
    },
    { 
      key: 'description', 
      label: 'Описание', 
      render: (transaction) => (
        <div>
          <div className="font-medium">{transaction.description}</div>
          <div className="text-xs text-muted-foreground">
            {transaction.relatedRepairId && `Заявка: ${transaction.relatedRepairId}`}
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      key: 'category', 
      label: 'Категория', 
      render: (transaction) => (
        <Badge variant="outline">{transaction.category}</Badge>
      ),
      sortable: true
    },
    { 
      key: 'paymentMethod', 
      label: 'Способ оплаты', 
      render: (transaction) => (
        <span className="text-sm text-muted-foreground">
          {transaction.paymentMethod || '-'}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Сумма', 
      render: (transaction) => (
        <div className={`font-bold text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.type === 'income' ? '+' : '-'}₽{transaction.amount.toLocaleString()}
        </div>
      ),
      sortable: true,
      width: 'w-[140px]'
    }
  ];

  const filters: Filter[] = [
    {
      key: 'type',
      label: 'Тип',
      options: [
        { value: 'income', label: 'Доходы' },
        { value: 'expense', label: 'Расходы' }
      ]
    }
  ];

  const TransactionForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Тип операции</Label>
        <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val as TransactionType})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Доход</SelectItem>
            <SelectItem value="expense">Расход</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Категория</Label>
        <Input 
          value={formData.category} 
          onChange={(e) => setFormData({...formData, category: e.target.value})} 
          placeholder="Ремонт, Запчасти, Зарплата..." 
        />
      </div>
      
      <div>
        <Label>Сумма</Label>
        <Input 
          type="number"
          value={formData.amount} 
          onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
          placeholder="0" 
        />
      </div>
      
      <div>
        <Label>Описание</Label>
        <Input 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="Детальное описание операции" 
        />
      </div>
      
      <div>
        <Label>Дата</Label>
        <Input 
          type="date"
          value={formData.date.toISOString().split('T')[0]} 
          onChange={(e) => setFormData({...formData, date: new Date(e.target.value)})} 
        />
      </div>
      
      <div>
        <Label>ID связанной заявки (опционально)</Label>
        <Input 
          value={formData.relatedRepairId} 
          onChange={(e) => setFormData({...formData, relatedRepairId: e.target.value})} 
          placeholder="REP-001" 
        />
      </div>
      
      <div>
        <Label>Способ оплаты (опционально)</Label>
        <Input 
          value={formData.paymentMethod} 
          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} 
          placeholder="Наличные, Карта, Перевод..." 
        />
      </div>
      
      <Button onClick={editingTransaction ? handleUpdate : handleCreate} className="w-full">
        {editingTransaction ? "Сохранить" : "Создать"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Финансы</h2>
          <p className="text-muted-foreground">Учет доходов и расходов</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetForm(); setEditingTransaction(null); }}>
              <Icon name="Plus" className="h-4 w-4" />
              Новая операция
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая операция</DialogTitle>
            </DialogHeader>
            <TransactionForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
            <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₽{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">За всё время</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общие расходы</CardTitle>
            <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₽{totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">За всё время</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? "Прибыль" : "Убыток"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Всего операций</CardTitle>
            <Icon name="FileText" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Зарегистрировано</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        filters={filters}
        searchKeys={['description', 'category', 'relatedRepairId', 'paymentMethod']}
        searchPlaceholder="Поиск по описанию, категории, ID заявки..."
        renderActions={(transaction) => (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openEdit(transaction)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Редактировать операцию</DialogTitle>
                </DialogHeader>
                <TransactionForm />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(transaction.id)}>
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </>
        )}
        emptyMessage="Нет финансовых операций"
      />
    </div>
  );
};

export default FinanceSection;

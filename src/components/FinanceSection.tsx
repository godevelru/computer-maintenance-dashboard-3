import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { DataTable, Column, Filter } from "@/components/ui/data-table";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { financeService } from "@/services/financeService";
import { Transaction, TransactionType } from "@/types";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinanceSection = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(financeService.getAll());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeView, setActiveView] = useState<"table" | "analytics">("table");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [formData, setFormData] = useState({
    type: "income" as TransactionType,
    category: "",
    amount: 0,
    description: "",
    date: new Date(),
    relatedRepairId: "",
    paymentMethod: "",
    tags: [] as string[],
    recurring: false
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));
  const paymentMethods = Array.from(new Set(transactions.map(t => t.paymentMethod).filter(Boolean))) as string[];

  const financeStats = useMemo(() => {
    let filteredTransactions = transactions;

    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.date >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.date <= new Date(dateTo)
      );
    }
    if (categoryFilter) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.category === categoryFilter
      );
    }

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;

    const byCategory: { [key: string]: { income: number; expense: number } } = {};
    filteredTransactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byCategory[t.category].income += t.amount;
      } else {
        byCategory[t.category].expense += t.amount;
      }
    });

    const byPaymentMethod: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const method = t.paymentMethod || 'Не указано';
      byPaymentMethod[method] = (byPaymentMethod[method] || 0) + t.amount;
    });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentTransactions = transactions.filter(t => t.date >= last30Days);
    
    const dailyData: { [key: string]: { income: number; expense: number; date: Date } } = {};
    recentTransactions.forEach(t => {
      const dateKey = t.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { income: 0, expense: 0, date: t.date };
      }
      if (t.type === 'income') {
        dailyData[dateKey].income += t.amount;
      } else {
        dailyData[dateKey].expense += t.amount;
      }
    });

    const chartData = Object.values(dailyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(d => ({
        date: d.date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        Доходы: d.income,
        Расходы: d.expense,
        Баланс: d.income - d.expense
      }));

    const categoryChartData = Object.entries(byCategory).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense,
      total: data.income + data.expense
    }));

    const paymentMethodData = Object.entries(byPaymentMethod).map(([name, value]) => ({
      name,
      value
    }));

    const avgTransactionAmount = filteredTransactions.length > 0 
      ? Math.round(filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length)
      : 0;

    const largestIncome = Math.max(...filteredTransactions.filter(t => t.type === 'income').map(t => t.amount), 0);
    const largestExpense = Math.max(...filteredTransactions.filter(t => t.type === 'expense').map(t => t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance,
      byCategory,
      byPaymentMethod,
      chartData,
      categoryChartData,
      paymentMethodData,
      avgTransactionAmount,
      largestIncome,
      largestExpense,
      filteredCount: filteredTransactions.length
    };
  }, [transactions, dateFrom, dateTo, categoryFilter]);

  const handleCreate = () => {
    if (!formData.category || formData.amount <= 0) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    financeService.create(formData);
    setTransactions(financeService.getAll());
    setIsCreateOpen(false);
    resetForm();
    toast.success("Операция создана");
  };

  const handleUpdate = () => {
    if (!editingTransaction) return;
    
    if (!formData.category || formData.amount <= 0) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    financeService.update(editingTransaction.id, formData);
    setTransactions(financeService.getAll());
    setEditingTransaction(null);
    resetForm();
    toast.success("Операция обновлена");
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить операцию?")) {
      financeService.delete(id);
      setTransactions(financeService.getAll());
      toast.success("Операция удалена");
    }
  };

  const handleDuplicate = (transaction: Transaction) => {
    financeService.create({
      ...transaction,
      date: new Date()
    });
    setTransactions(financeService.getAll());
    toast.success("Операция дублирована");
  };

  const resetForm = () => {
    setFormData({
      type: "income",
      category: "",
      amount: 0,
      description: "",
      date: new Date(),
      relatedRepairId: "",
      paymentMethod: "",
      tags: [],
      recurring: false
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
      paymentMethod: transaction.paymentMethod || "",
      tags: (transaction as any).tags || [],
      recurring: false
    });
  };

  const columns: Column<Transaction>[] = [
    { 
      key: 'date', 
      label: 'Дата', 
      render: (transaction) => (
        <span className="text-sm whitespace-nowrap">{transaction.date.toLocaleDateString('ru-RU')}</span>
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
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            {transaction.relatedRepairId && (
              <span className="flex items-center gap-1">
                <Icon name="Link" className="h-3 w-3" />
                {transaction.relatedRepairId}
              </span>
            )}
            {(transaction as any).tags && (transaction as any).tags.length > 0 && (
              <span className="flex items-center gap-1">
                {(transaction as any).tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </span>
            )}
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
      sortable: true,
      width: 'w-[140px]'
    },
    { 
      key: 'paymentMethod', 
      label: 'Способ оплаты', 
      render: (transaction) => (
        <span className="text-sm text-muted-foreground">
          {transaction.paymentMethod || '-'}
        </span>
      ),
      width: 'w-[140px]'
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
    },
    ...(categories.length > 0 ? [{
      key: 'category',
      label: 'Категория',
      options: categories.map(c => ({ value: c, label: c }))
    }] : [])
  ];

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

  const TransactionForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Тип операции</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val as TransactionType})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">
                <div className="flex items-center gap-2">
                  <Icon name="ArrowDownLeft" className="h-4 w-4 text-green-600" />
                  Доход
                </div>
              </SelectItem>
              <SelectItem value="expense">
                <div className="flex items-center gap-2">
                  <Icon name="ArrowUpRight" className="h-4 w-4 text-red-600" />
                  Расход
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Сумма *</Label>
          <Input 
            type="number"
            min="0"
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
            placeholder="0" 
          />
        </div>
      </div>
      
      <div>
        <Label>Категория *</Label>
        <div className="flex gap-2">
          <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите или введите новую" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            placeholder="Или введите новую" 
            className="flex-1"
          />
        </div>
      </div>
      
      <div>
        <Label>Описание</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="Детальное описание операции" 
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Дата</Label>
          <Input 
            type="date"
            value={formData.date.toISOString().split('T')[0]} 
            onChange={(e) => setFormData({...formData, date: new Date(e.target.value)})} 
          />
        </div>
        
        <div>
          <Label>Способ оплаты</Label>
          <div className="flex gap-2">
            <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              value={formData.paymentMethod} 
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} 
              placeholder="Или новый" 
            />
          </div>
        </div>
      </div>
      
      <div>
        <Label>ID связанной заявки</Label>
        <Input 
          value={formData.relatedRepairId} 
          onChange={(e) => setFormData({...formData, relatedRepairId: e.target.value})} 
          placeholder="REP-001" 
        />
      </div>

      {formData.amount > 0 && (
        <div className={`p-4 rounded-lg ${formData.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-sm text-muted-foreground">Итоговая сумма</div>
          <div className={`text-3xl font-bold ${formData.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {formData.type === 'income' ? '+' : '-'}₽{formData.amount.toLocaleString()}
          </div>
        </div>
      )}
      
      <Button onClick={editingTransaction ? handleUpdate : handleCreate} className="w-full">
        {editingTransaction ? "Сохранить изменения" : "Создать операцию"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Финансы</h2>
          <p className="text-muted-foreground">Учет доходов, расходов и финансовая аналитика</p>
        </div>
        <div className="flex gap-2">
          <ImportExportDialog
            data={transactions}
            filename="finance"
            title="Финансы"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'date', label: 'Дата' },
              { key: 'type', label: 'Тип' },
              { key: 'category', label: 'Категория' },
              { key: 'description', label: 'Описание' },
              { key: 'amount', label: 'Сумма' },
              { key: 'paymentMethod', label: 'Способ оплаты' },
              { key: 'relatedRepairId', label: 'ID заявки' },
            ]}
            onImport={(data) => {
              toast.success(`Импортировано ${data.length} операций`);
            }}
          />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setEditingTransaction(null); }}>
                <Icon name="Plus" className="h-4 w-4" />
                Новая операция
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая финансовая операция</DialogTitle>
              </DialogHeader>
              <TransactionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
            <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₽{financeStats.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateFrom || dateTo ? 'За период' : 'За всё время'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общие расходы</CardTitle>
            <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₽{financeStats.totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateFrom || dateTo ? 'За период' : 'За всё время'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            <Icon name="DollarSign" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${financeStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₽{financeStats.balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {financeStats.balance >= 0 ? "Прибыль" : "Убыток"}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Операций</CardTitle>
            <Icon name="FileText" className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{financeStats.filteredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateFrom || dateTo ? 'Найдено' : 'Всего'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        <Button 
          variant={activeView === "table" ? "default" : "ghost"}
          onClick={() => setActiveView("table")}
        >
          <Icon name="Table" className="h-4 w-4 mr-2" />
          Таблица
        </Button>
        <Button 
          variant={activeView === "analytics" ? "default" : "ghost"}
          onClick={() => setActiveView("analytics")}
        >
          <Icon name="BarChart3" className="h-4 w-4 mr-2" />
          Аналитика
        </Button>
      </div>

      {activeView === "table" && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>От даты</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>До даты</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Категория</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все категории</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(dateFrom || dateTo || categoryFilter) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setCategoryFilter("");
                  }}
                >
                  <Icon name="X" className="h-4 w-4 mr-2" />
                  Сбросить
                </Button>
              </div>
            )}
          </div>

          <DataTable
            data={transactions.filter(t => {
              if (dateFrom && t.date < new Date(dateFrom)) return false;
              if (dateTo && t.date > new Date(dateTo)) return false;
              if (categoryFilter && t.category !== categoryFilter) return false;
              return true;
            })}
            columns={columns}
            filters={filters}
            searchKeys={['description', 'category', 'relatedRepairId', 'paymentMethod']}
            searchPlaceholder="Поиск по описанию, категории, ID заявки..."
            renderActions={(transaction) => (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicate(transaction)}
                  title="Дублировать"
                >
                  <Icon name="Copy" className="h-4 w-4" />
                </Button>
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
      )}

      {activeView === "analytics" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Динамика доходов и расходов</CardTitle>
              <CardDescription>За последние 30 дней</CardDescription>
            </CardHeader>
            <CardContent>
              {financeStats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financeStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Доходы" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Расходы" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="Баланс" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Недостаточно данных для построения графика
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Доходы и расходы по категориям</CardTitle>
                <CardDescription>Сравнение категорий</CardDescription>
              </CardHeader>
              <CardContent>
                {financeStats.categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financeStats.categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" name="Доход" fill="#10b981" />
                      <Bar dataKey="expense" name="Расход" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных по категориям
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Распределение по способам оплаты</CardTitle>
                <CardDescription>Все операции</CardDescription>
              </CardHeader>
              <CardContent>
                {financeStats.paymentMethodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={financeStats.paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ₽${entry.value.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {financeStats.paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных по способам оплаты
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Средний чек</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₽{financeStats.avgTransactionAmount.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">На операцию</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Максимальный доход</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₽{financeStats.largestIncome.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Самая крупная операция</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Максимальный расход</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">₽{financeStats.largestExpense.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Самая крупная операция</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSection;

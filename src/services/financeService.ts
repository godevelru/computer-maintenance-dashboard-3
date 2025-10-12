import { Transaction } from '@/types';
import { mockTransactions } from '@/data/mockData';

class FinanceService {
  private transactions: Transaction[] = [...mockTransactions];

  getAll(): Transaction[] {
    return [...this.transactions];
  }

  getById(id: string): Transaction | undefined {
    return this.transactions.find(transaction => transaction.id === id);
  }

  create(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `TRX-${String(this.transactions.length + 1).padStart(3, '0')}`
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  update(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return undefined;

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates
    };
    return this.transactions[index];
  }

  delete(id: string): boolean {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  }

  getByType(type: Transaction['type']): Transaction[] {
    return this.transactions.filter(transaction => transaction.type === type);
  }

  getByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactions.filter(transaction => 
      transaction.date >= startDate && transaction.date <= endDate
    );
  }

  getTotalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }
}

export const financeService = new FinanceService();

import { SupportTicket } from '@/types';
import { mockSupportTickets } from '@/data/mockData';

class SupportService {
  private tickets: SupportTicket[] = [...mockSupportTickets];

  getAll(): SupportTicket[] {
    return [...this.tickets];
  }

  getById(id: string): SupportTicket | undefined {
    return this.tickets.find(ticket => ticket.id === id);
  }

  create(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): SupportTicket {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TKT-${String(this.tickets.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.push(newTicket);
    return newTicket;
  }

  update(id: string, updates: Partial<SupportTicket>): SupportTicket | undefined {
    const index = this.tickets.findIndex(ticket => ticket.id === id);
    if (index === -1) return undefined;

    this.tickets[index] = {
      ...this.tickets[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.tickets[index];
  }

  delete(id: string): boolean {
    const index = this.tickets.findIndex(ticket => ticket.id === id);
    if (index === -1) return false;
    this.tickets.splice(index, 1);
    return true;
  }

  getByStatus(status: SupportTicket['status']): SupportTicket[] {
    return this.tickets.filter(ticket => ticket.status === status);
  }

  getByUser(userId: string): SupportTicket[] {
    return this.tickets.filter(ticket => ticket.userId === userId);
  }
}

export const supportService = new SupportService();

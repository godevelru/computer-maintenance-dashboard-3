import { Client } from '@/types';
import { mockClients } from '@/data/mockData';

class ClientService {
  private clients: Client[] = [...mockClients];

  getAll(): Client[] {
    return [...this.clients];
  }

  getById(id: string): Client | undefined {
    return this.clients.find(client => client.id === id);
  }

  create(client: Omit<Client, 'id' | 'registeredAt' | 'totalOrders' | 'totalSpent'>): Client {
    const newClient: Client = {
      ...client,
      id: `CLI-${String(this.clients.length + 1).padStart(3, '0')}`,
      registeredAt: new Date(),
      totalOrders: 0,
      totalSpent: 0
    };
    this.clients.push(newClient);
    return newClient;
  }

  update(id: string, updates: Partial<Client>): Client | undefined {
    const index = this.clients.findIndex(client => client.id === id);
    if (index === -1) return undefined;

    this.clients[index] = {
      ...this.clients[index],
      ...updates
    };
    return this.clients[index];
  }

  delete(id: string): boolean {
    const index = this.clients.findIndex(client => client.id === id);
    if (index === -1) return false;
    this.clients.splice(index, 1);
    return true;
  }

  search(query: string): Client[] {
    const lowerQuery = query.toLowerCase();
    return this.clients.filter(client =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery) ||
      client.phone.includes(query)
    );
  }
}

export const clientService = new ClientService();

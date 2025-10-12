import { Repair } from '@/types';
import { mockRepairs } from '@/data/mockData';

class RepairService {
  private repairs: Repair[] = [...mockRepairs];

  getAll(): Repair[] {
    return [...this.repairs];
  }

  getById(id: string): Repair | undefined {
    return this.repairs.find(repair => repair.id === id);
  }

  create(repair: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'>): Repair {
    const newRepair: Repair = {
      ...repair,
      id: `REP-${String(this.repairs.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.repairs.push(newRepair);
    return newRepair;
  }

  update(id: string, updates: Partial<Repair>): Repair | undefined {
    const index = this.repairs.findIndex(repair => repair.id === id);
    if (index === -1) return undefined;

    this.repairs[index] = {
      ...this.repairs[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.repairs[index];
  }

  delete(id: string): boolean {
    const index = this.repairs.findIndex(repair => repair.id === id);
    if (index === -1) return false;
    this.repairs.splice(index, 1);
    return true;
  }

  getByStatus(status: Repair['status']): Repair[] {
    return this.repairs.filter(repair => repair.status === status);
  }

  getByClient(clientId: string): Repair[] {
    return this.repairs.filter(repair => repair.clientId === clientId);
  }

  getByTechnician(technicianId: string): Repair[] {
    return this.repairs.filter(repair => repair.technicianId === technicianId);
  }
}

export const repairService = new RepairService();

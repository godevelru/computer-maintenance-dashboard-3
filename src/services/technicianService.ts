import { Technician } from '@/types';
import { mockTechnicians } from '@/data/mockData';

class TechnicianService {
  private technicians: Technician[] = [...mockTechnicians];

  getAll(): Technician[] {
    return [...this.technicians];
  }

  getById(id: string): Technician | undefined {
    return this.technicians.find(tech => tech.id === id);
  }

  create(technician: Omit<Technician, 'id' | 'completedRepairs' | 'rating'>): Technician {
    const newTechnician: Technician = {
      ...technician,
      id: `TECH-${String(this.technicians.length + 1).padStart(3, '0')}`,
      completedRepairs: 0,
      rating: 0
    };
    this.technicians.push(newTechnician);
    return newTechnician;
  }

  update(id: string, updates: Partial<Technician>): Technician | undefined {
    const index = this.technicians.findIndex(tech => tech.id === id);
    if (index === -1) return undefined;

    this.technicians[index] = {
      ...this.technicians[index],
      ...updates
    };
    return this.technicians[index];
  }

  delete(id: string): boolean {
    const index = this.technicians.findIndex(tech => tech.id === id);
    if (index === -1) return false;
    this.technicians.splice(index, 1);
    return true;
  }

  getByStatus(status: Technician['status']): Technician[] {
    return this.technicians.filter(tech => tech.status === status);
  }

  getAvailable(): Technician[] {
    return this.technicians.filter(tech => tech.status === 'available');
  }
}

export const technicianService = new TechnicianService();

import { Schedule } from '@/types';
import { mockSchedule } from '@/data/mockData';

class ScheduleService {
  private schedules: Schedule[] = [...mockSchedule];

  getAll(): Schedule[] {
    return [...this.schedules];
  }

  getById(id: string): Schedule | undefined {
    return this.schedules.find(schedule => schedule.id === id);
  }

  create(schedule: Omit<Schedule, 'id'>): Schedule {
    const newSchedule: Schedule = {
      ...schedule,
      id: `SCH-${String(this.schedules.length + 1).padStart(3, '0')}`
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  update(id: string, updates: Partial<Schedule>): Schedule | undefined {
    const index = this.schedules.findIndex(schedule => schedule.id === id);
    if (index === -1) return undefined;

    this.schedules[index] = {
      ...this.schedules[index],
      ...updates
    };
    return this.schedules[index];
  }

  delete(id: string): boolean {
    const index = this.schedules.findIndex(schedule => schedule.id === id);
    if (index === -1) return false;
    this.schedules.splice(index, 1);
    return true;
  }

  getByTechnician(technicianId: string): Schedule[] {
    return this.schedules.filter(schedule => schedule.technicianId === technicianId);
  }

  getByDate(date: Date): Schedule[] {
    return this.schedules.filter(schedule => 
      schedule.date.toDateString() === date.toDateString()
    );
  }
}

export const scheduleService = new ScheduleService();

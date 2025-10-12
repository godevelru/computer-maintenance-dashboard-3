import { WarehouseZone, StockMovement } from '@/types';
import { mockWarehouseZones, mockStockMovements } from '@/data/mockData';

class WarehouseService {
  private zones: WarehouseZone[] = [...mockWarehouseZones];
  private movements: StockMovement[] = [...mockStockMovements];

  getAllZones(): WarehouseZone[] {
    return [...this.zones];
  }

  getZoneById(id: string): WarehouseZone | undefined {
    return this.zones.find(zone => zone.id === id);
  }

  createZone(zone: Omit<WarehouseZone, 'id'>): WarehouseZone {
    const newZone: WarehouseZone = {
      ...zone,
      id: `ZONE-${String(this.zones.length + 1).padStart(3, '0')}`
    };
    this.zones.push(newZone);
    return newZone;
  }

  updateZone(id: string, updates: Partial<WarehouseZone>): WarehouseZone | undefined {
    const index = this.zones.findIndex(zone => zone.id === id);
    if (index === -1) return undefined;

    this.zones[index] = {
      ...this.zones[index],
      ...updates
    };
    return this.zones[index];
  }

  deleteZone(id: string): boolean {
    const index = this.zones.findIndex(zone => zone.id === id);
    if (index === -1) return false;
    this.zones.splice(index, 1);
    return true;
  }

  getAllMovements(): StockMovement[] {
    return [...this.movements];
  }

  getMovementById(id: string): StockMovement | undefined {
    return this.movements.find(movement => movement.id === id);
  }

  createMovement(movement: Omit<StockMovement, 'id'>): StockMovement {
    const newMovement: StockMovement = {
      ...movement,
      id: `MOV-${String(this.movements.length + 1).padStart(3, '0')}`
    };
    this.movements.push(newMovement);
    return newMovement;
  }

  getMovementsByItem(itemId: string): StockMovement[] {
    return this.movements.filter(movement => movement.itemId === itemId);
  }

  getMovementsByZone(zoneId: string): StockMovement[] {
    return this.movements.filter(movement => 
      movement.fromZone === zoneId || movement.toZone === zoneId
    );
  }
}

export const warehouseService = new WarehouseService();

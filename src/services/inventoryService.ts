import { InventoryItem } from '@/types';
import { mockInventory } from '@/data/mockData';

class InventoryService {
  private items: InventoryItem[] = [...mockInventory];

  getAll(): InventoryItem[] {
    return [...this.items];
  }

  getById(id: string): InventoryItem | undefined {
    return this.items.find(item => item.id === id);
  }

  create(item: Omit<InventoryItem, 'id'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: `INV-${String(this.items.length + 1).padStart(3, '0')}`
    };
    this.items.push(newItem);
    return newItem;
  }

  update(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;

    this.items[index] = {
      ...this.items[index],
      ...updates
    };
    return this.items[index];
  }

  delete(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  getLowStock(): InventoryItem[] {
    return this.items.filter(item => item.quantity <= item.minQuantity);
  }

  getByCategory(category: string): InventoryItem[] {
    return this.items.filter(item => item.category === category);
  }

  updateQuantity(id: string, quantity: number): InventoryItem | undefined {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;

    this.items[index].quantity = quantity;
    return this.items[index];
  }
}

export const inventoryService = new InventoryService();

export type RepairStatus = 'new' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TechnicianStatus = 'available' | 'busy' | 'on_break' | 'off_duty';
export type TransactionType = 'income' | 'expense';

export interface Repair {
  id: string;
  clientId: string;
  clientName: string;
  deviceType: string;
  deviceModel: string;
  problem: string;
  status: RepairStatus;
  priority: Priority;
  technicianId?: string;
  technicianName?: string;
  estimatedCost: number;
  finalCost?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  registeredAt: Date;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier?: string;
  location?: string;
  lastRestocked?: Date;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  status: TechnicianStatus;
  rating: number;
  completedRepairs: number;
  hireDate: Date;
  hourlyRate: number;
}

export interface Schedule {
  id: string;
  technicianId: string;
  technicianName: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: Date;
  relatedRepairId?: string;
  paymentMethod?: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  temperature?: number;
  humidity?: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  type: 'in' | 'out';
  fromZone?: string;
  toZone?: string;
  date: Date;
  reason: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  generatedAt: Date;
  generatedBy: string;
  period: string;
  data: any;
}

export interface Settings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  workingHours: {
    start: string;
    end: string;
  };
  currency: string;
  taxRate: number;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

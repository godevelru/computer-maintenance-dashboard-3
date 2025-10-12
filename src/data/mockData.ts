import { Repair, Client, InventoryItem, Technician, Schedule, Transaction, WarehouseZone, StockMovement, SupportTicket, Settings } from '@/types';

export const mockRepairs: Repair[] = [
  {
    id: 'REP-001',
    clientId: 'CLI-001',
    clientName: 'Иван Петров',
    deviceType: 'Ноутбук',
    deviceModel: 'Lenovo ThinkPad X1',
    problem: 'Не включается, требуется диагностика',
    status: 'in_progress',
    priority: 'high',
    technicianId: 'TECH-001',
    technicianName: 'Алексей Смирнов',
    estimatedCost: 5000,
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-12'),
    notes: 'Проблема с материнской платой'
  },
  {
    id: 'REP-002',
    clientId: 'CLI-002',
    clientName: 'Мария Сидорова',
    deviceType: 'ПК',
    deviceModel: 'Custom Build',
    problem: 'Перегрев процессора',
    status: 'waiting_parts',
    priority: 'medium',
    technicianId: 'TECH-002',
    technicianName: 'Дмитрий Козлов',
    estimatedCost: 3000,
    createdAt: new Date('2025-10-09'),
    updatedAt: new Date('2025-10-11')
  },
  {
    id: 'REP-003',
    clientId: 'CLI-003',
    clientName: 'Сергей Волков',
    deviceType: 'Моноблок',
    deviceModel: 'iMac 27"',
    problem: 'Замена жесткого диска на SSD',
    status: 'new',
    priority: 'low',
    estimatedCost: 8000,
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-12')
  }
];

export const mockClients: Client[] = [
  {
    id: 'CLI-001',
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    phone: '+7 (999) 123-45-67',
    address: 'ул. Ленина, д. 10, кв. 5',
    registeredAt: new Date('2024-05-15'),
    totalOrders: 8,
    totalSpent: 45000,
    notes: 'Постоянный клиент'
  },
  {
    id: 'CLI-002',
    name: 'Мария Сидорова',
    email: 'maria.sidorova@example.com',
    phone: '+7 (999) 234-56-78',
    address: 'пр. Мира, д. 25',
    registeredAt: new Date('2024-08-20'),
    totalOrders: 3,
    totalSpent: 12000
  },
  {
    id: 'CLI-003',
    name: 'Сергей Волков',
    email: 'sergey.volkov@example.com',
    phone: '+7 (999) 345-67-89',
    registeredAt: new Date('2025-01-10'),
    totalOrders: 1,
    totalSpent: 0
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Термопаста Arctic MX-4',
    category: 'Расходники',
    sku: 'ARCTIC-MX4',
    quantity: 25,
    minQuantity: 10,
    price: 450,
    supplier: 'TechSupply',
    location: 'A-12',
    lastRestocked: new Date('2025-09-15')
  },
  {
    id: 'INV-002',
    name: 'SSD Samsung 970 EVO 1TB',
    category: 'Накопители',
    sku: 'SAMSUNG-970-1TB',
    quantity: 8,
    minQuantity: 5,
    price: 12000,
    supplier: 'ComputerParts',
    location: 'B-05'
  },
  {
    id: 'INV-003',
    name: 'Оперативная память DDR4 16GB',
    category: 'Память',
    sku: 'DDR4-16GB-3200',
    quantity: 3,
    minQuantity: 8,
    price: 5500,
    supplier: 'TechSupply',
    location: 'B-08',
    lastRestocked: new Date('2025-08-20')
  }
];

export const mockTechnicians: Technician[] = [
  {
    id: 'TECH-001',
    name: 'Алексей Смирнов',
    email: 'alexey.smirnov@company.com',
    phone: '+7 (999) 111-22-33',
    specialization: ['Ноутбуки', 'Материнские платы', 'Диагностика'],
    status: 'busy',
    rating: 4.8,
    completedRepairs: 245,
    hireDate: new Date('2022-03-15'),
    hourlyRate: 1500
  },
  {
    id: 'TECH-002',
    name: 'Дмитрий Козлов',
    email: 'dmitry.kozlov@company.com',
    phone: '+7 (999) 222-33-44',
    specialization: ['ПК', 'Охлаждение', 'Сборка'],
    status: 'available',
    rating: 4.6,
    completedRepairs: 189,
    hireDate: new Date('2023-01-20'),
    hourlyRate: 1300
  },
  {
    id: 'TECH-003',
    name: 'Елена Морозова',
    email: 'elena.morozova@company.com',
    phone: '+7 (999) 333-44-55',
    specialization: ['Моноблоки', 'MacOS', 'Данные'],
    status: 'on_break',
    rating: 4.9,
    completedRepairs: 312,
    hireDate: new Date('2021-06-10'),
    hourlyRate: 1800
  }
];

export const mockSchedule: Schedule[] = [
  {
    id: 'SCH-001',
    technicianId: 'TECH-001',
    technicianName: 'Алексей Смирнов',
    date: new Date('2025-10-12'),
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '13:00',
    breakEnd: '14:00'
  },
  {
    id: 'SCH-002',
    technicianId: 'TECH-002',
    technicianName: 'Дмитрий Козлов',
    date: new Date('2025-10-12'),
    startTime: '10:00',
    endTime: '19:00',
    breakStart: '14:00',
    breakEnd: '15:00'
  },
  {
    id: 'SCH-003',
    technicianId: 'TECH-003',
    technicianName: 'Елена Морозова',
    date: new Date('2025-10-12'),
    startTime: '08:00',
    endTime: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TRX-001',
    type: 'income',
    category: 'Ремонт',
    amount: 5000,
    description: 'Оплата за ремонт ноутбука REP-001',
    date: new Date('2025-10-11'),
    relatedRepairId: 'REP-001',
    paymentMethod: 'Карта'
  },
  {
    id: 'TRX-002',
    type: 'expense',
    category: 'Закупка',
    amount: 36000,
    description: 'Закупка комплектующих',
    date: new Date('2025-10-10'),
    paymentMethod: 'Перевод'
  },
  {
    id: 'TRX-003',
    type: 'income',
    category: 'Ремонт',
    amount: 3000,
    description: 'Оплата за диагностику',
    date: new Date('2025-10-09'),
    paymentMethod: 'Наличные'
  }
];

export const mockWarehouseZones: WarehouseZone[] = [
  {
    id: 'ZONE-001',
    name: 'Зона A - Расходники',
    capacity: 100,
    currentLoad: 67,
    temperature: 22,
    humidity: 45
  },
  {
    id: 'ZONE-002',
    name: 'Зона B - Комплектующие',
    capacity: 200,
    currentLoad: 145,
    temperature: 20,
    humidity: 40
  },
  {
    id: 'ZONE-003',
    name: 'Зона C - Устройства',
    capacity: 50,
    currentLoad: 28,
    temperature: 21,
    humidity: 42
  }
];

export const mockStockMovements: StockMovement[] = [
  {
    id: 'MOV-001',
    itemId: 'INV-001',
    itemName: 'Термопаста Arctic MX-4',
    quantity: 5,
    type: 'out',
    fromZone: 'ZONE-001',
    date: new Date('2025-10-12'),
    reason: 'Использовано в ремонтах'
  },
  {
    id: 'MOV-002',
    itemId: 'INV-002',
    itemName: 'SSD Samsung 970 EVO 1TB',
    quantity: 10,
    type: 'in',
    toZone: 'ZONE-002',
    date: new Date('2025-10-10'),
    reason: 'Поступление от поставщика'
  }
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'TKT-001',
    userId: 'USR-001',
    userName: 'Администратор',
    subject: 'Проблема с печатью отчетов',
    description: 'Не могу распечатать финансовый отчет за месяц',
    status: 'open',
    priority: 'medium',
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-12')
  },
  {
    id: 'TKT-002',
    userId: 'TECH-001',
    userName: 'Алексей Смирнов',
    subject: 'Запрос на добавление нового поставщика',
    description: 'Необходимо добавить нового поставщика комплектующих',
    status: 'in_progress',
    priority: 'low',
    createdAt: new Date('2025-10-11'),
    updatedAt: new Date('2025-10-12'),
    assignedTo: 'Администратор'
  }
];

export const mockSettings: Settings = {
  companyName: 'CompRepair',
  email: 'info@comprepair.ru',
  phone: '+7 (499) 123-45-67',
  address: 'Москва, ул. Тверская, д. 15',
  workingHours: {
    start: '09:00',
    end: '18:00'
  },
  currency: 'RUB',
  taxRate: 20,
  notifications: {
    email: true,
    sms: false
  }
};

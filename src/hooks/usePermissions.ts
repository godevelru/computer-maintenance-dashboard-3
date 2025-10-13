import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export const usePermissions = () => {
  const { user, hasPermission, canAccess } = useAuth();

  const can = {
    viewDashboard: () => canAccess('dashboard'),
    viewRepairs: () => canAccess('repairs'),
    createRepair: () => hasPermission(['admin', 'manager', 'receptionist']),
    editRepair: () => hasPermission(['admin', 'manager', 'technician']),
    deleteRepair: () => hasPermission(['admin', 'manager']),
    
    viewClients: () => canAccess('clients'),
    createClient: () => hasPermission(['admin', 'manager', 'receptionist']),
    editClient: () => hasPermission(['admin', 'manager', 'receptionist']),
    deleteClient: () => hasPermission(['admin', 'manager']),
    
    viewInventory: () => canAccess('inventory'),
    manageInventory: () => hasPermission(['admin', 'manager']),
    
    viewWarehouse: () => canAccess('warehouse'),
    manageWarehouse: () => hasPermission(['admin', 'manager']),
    
    viewTechnicians: () => canAccess('technicians'),
    manageTechnicians: () => hasPermission(['admin', 'manager']),
    
    viewSchedule: () => canAccess('schedule'),
    manageSchedule: () => hasPermission(['admin', 'manager']),
    
    viewFinance: () => canAccess('finance'),
    manageFinance: () => hasPermission(['admin', 'manager']),
    
    viewReports: () => canAccess('reports'),
    createReport: () => hasPermission(['admin', 'manager']),
    
    viewSettings: () => canAccess('settings'),
    manageSettings: () => hasPermission('admin'),
    
    exportData: () => hasPermission(['admin', 'manager']),
    importData: () => hasPermission(['admin', 'manager']),
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isTechnician = user?.role === 'technician';
  const isReceptionist = user?.role === 'receptionist';

  return {
    can,
    isAdmin,
    isManager,
    isTechnician,
    isReceptionist,
    role: user?.role,
    user
  };
};

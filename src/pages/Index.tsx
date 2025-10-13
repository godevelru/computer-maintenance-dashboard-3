import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import DashboardSection from "@/components/DashboardSection";
import RepairsSection from "@/components/RepairsSection";
import ClientsSection from "@/components/ClientsSection";
import InventorySection from "@/components/InventorySection";
import TechniciansSection from "@/components/TechniciansSection";
import ScheduleSection from "@/components/ScheduleSection";
import FinanceSection from "@/components/FinanceSection";
import ReportsSection from "@/components/ReportsSection";
import SettingsSection from "@/components/SettingsSection";
import SupportSection from "@/components/SupportSection";
import WarehouseSection from "@/components/WarehouseSection";
import RolesManager from "@/components/RolesManager";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { canAccess } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard", section: "dashboard" },
    { id: "repairs", label: "Заявки", icon: "Wrench", section: "repairs" },
    { id: "clients", label: "Клиенты", icon: "Users", section: "clients" },
    { id: "inventory", label: "Инвентарь", icon: "Package", section: "inventory" },
    { id: "technicians", label: "Техники", icon: "UserCheck", section: "technicians" },
    { id: "schedule", label: "График", icon: "Calendar", section: "schedule" },
    { id: "finance", label: "Финансы", icon: "DollarSign", section: "finance" },
    { id: "warehouse", label: "Склад", icon: "Warehouse", section: "warehouse" },
    { id: "reports", label: "Отчеты", icon: "FileText", section: "reports" },
    { id: "roles", label: "Роли и права", icon: "Shield", section: "roles" },
    { id: "settings", label: "Настройки", icon: "Settings", section: "settings" },
    { id: "support", label: "Поддержка", icon: "HelpCircle", section: "support" },
  ];

  const accessibleMenuItems = menuItems.filter(item => canAccess(item.section));

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardSection />;
      case "repairs": return <RepairsSection />;
      case "clients": return <ClientsSection />;
      case "inventory": return <InventorySection />;
      case "technicians": return <TechniciansSection />;
      case "schedule": return <ScheduleSection />;
      case "finance": return <FinanceSection />;
      case "warehouse": return <WarehouseSection />;
      case "reports": return <ReportsSection />;
      case "roles": return <RolesManager />;
      case "settings": return <SettingsSection />;
      case "support": return <SupportSection />;
      default: return <DashboardSection />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <aside 
        className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-lg ${
          sidebarCollapsed ? "w-16" : "w-72"
        }`}
      >
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <Icon name="Computer" className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-xl">CompRepair</h1>
                <p className="text-xs text-sidebar-foreground/70 mt-0.5">Система управления</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          >
            <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {accessibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1.5 transition-all ${
                activeSection === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm scale-[1.02]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
          
          {menuItems.length !== accessibleMenuItems.length && !sidebarCollapsed && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Lock" className="h-3 w-3" />
                <span>{menuItems.length - accessibleMenuItems.length} разделов скрыто</span>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {!sidebarCollapsed && <UserMenu />}
          {sidebarCollapsed && (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="User" className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/60 p-5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h2>
              {!canAccess(activeSection) && (
                <Badge variant="destructive" className="gap-1">
                  <Icon name="Lock" className="h-3 w-3" />
                  Нет доступа
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-xl hover:shadow-md transition-shadow">
                <Icon name="Bell" className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl hover:shadow-md transition-shadow">
                <Icon name="Search" className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1800px] mx-auto">
          {canAccess(activeSection) ? (
            renderSection()
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="Lock" className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Доступ запрещён</h3>
                <p className="text-muted-foreground mb-4">
                  У вас недостаточно прав для просмотра этого раздела
                </p>
                <Button onClick={() => setActiveSection('dashboard')} variant="outline">
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Вернуться к дашборду
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
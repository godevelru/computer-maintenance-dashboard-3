import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
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

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
    { id: "repairs", label: "Заявки", icon: "Wrench" },
    { id: "clients", label: "Клиенты", icon: "Users" },
    { id: "inventory", label: "Инвентарь", icon: "Package" },
    { id: "technicians", label: "Техники", icon: "UserCheck" },
    { id: "schedule", label: "График", icon: "Calendar" },
    { id: "finance", label: "Финансы", icon: "DollarSign" },
    { id: "warehouse", label: "Склад", icon: "Warehouse" },
    { id: "reports", label: "Отчеты", icon: "FileText" },
    { id: "settings", label: "Настройки", icon: "Settings" },
    { id: "support", label: "Поддержка", icon: "HelpCircle" },
  ];

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
          {menuItems.map((item) => (
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
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
              <Icon name="User" className="h-6 w-6 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sidebar-foreground text-sm truncate">Администратор</div>
                <div className="text-xs text-sidebar-foreground/70 mt-0.5">admin@company.ru</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/60 p-5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h2>
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
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
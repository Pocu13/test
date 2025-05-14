
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Settings, ClipboardList, BarChart3 } from "lucide-react";

const menuItems = [
  {
    icon: ClipboardList,
    label: "Prenotazioni",
    path: "/admin/prenotazioni"
  }, 
  {
    icon: Calendar,
    label: "Calendario",
    path: "/admin/calendario"
  },
  {
    icon: BarChart3,
    label: "Dashboard",
    path: "/admin/dashboard"
  },
  {
    icon: Settings,
    label: "Impostazioni",
    path: "/admin/impostazioni"
  }
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col h-full pt-4">
      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-2 px-3 rounded-md text-sm transition-all duration-200 ease-in-out transform hover:scale-105",
                  isActive
                    ? "bg-restaurant-50 text-restaurant-600 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors duration-200",
                      isActive ? "text-restaurant-500" : "text-gray-400"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-muted-foreground">
          Tavola In Fiore
          <br />
          Sistema di gestione prenotazioni v1.0
        </div>
      </div>
    </nav>
  );
}

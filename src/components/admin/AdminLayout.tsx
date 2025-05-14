
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarToggle } from "./SidebarToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  // Inizializza la sidebar come nascosta
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    // La sidebar è sempre nascosta all'inizio indipendentemente dal dispositivo
    setIsSidebarVisible(false);
  }, []);

  // Chiudi la sidebar quando cambia la location (quando si naviga tra le pagine)
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [location]);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="h-screen flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarToggle onToggle={setIsSidebarVisible} isOpen={isSidebarVisible} />
        <div className={cn(
          "fixed inset-0 z-20 transition-transform duration-300 ease-in-out bg-white shadow-lg",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full",
          isMobile ? "top-16" : ""
        )}>
          <AdminSidebar />
        </div>
        <main 
          className={cn(
            "flex-1 overflow-auto bg-gray-50 transition-all duration-300",
            isMobile ? "pt-16" : "",
            !isMobile && isSidebarVisible ? "md:ml-64" : "ml-0"
          )}
        >
          <div className="p-4 sm:p-6 min-h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}


import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
      <div className="flex items-center space-x-2">
        <div className="rounded-full bg-restaurant-500 h-8 w-8 flex items-center justify-center">
          <span className="text-white font-bold">TR</span>
        </div>
        <h1 className="text-lg font-semibold">Tavola In Fiore - Amministrazione</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={logout}
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ReservationsPage from "./pages/admin/ReservationsPage";
import DashboardPage from "./pages/admin/DashboardPage";
import SettingsPage from "./pages/admin/SettingsPage";
import CalendarPage from "./pages/admin/CalendarPage";

// Crea un nuovo QueryClient per React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <ReservationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />}>
                <Route path="prenotazioni" element={<ReservationsPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="calendario" element={<CalendarPage />} />
                <Route path="impostazioni" element={<SettingsPage />} />
                <Route index element={<ReservationsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ReservationProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

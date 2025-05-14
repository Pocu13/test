
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ReservationProvider } from "@/contexts/ReservationContext";

export default function Admin() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ReservationProvider>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </ReservationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

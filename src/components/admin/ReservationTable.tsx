
import { useReservations } from "@/contexts/ReservationContext";
import { Reservation, ReservationStatus } from "@/types";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ReservationCard } from "@/components/admin/ReservationCard";
import { ReservationStatusBadge } from "@/components/admin/ReservationStatusBadge";
import { ReservationDeleteDialog } from "@/components/admin/ReservationDeleteDialog";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReservationTableProps {
  reservations: Reservation[];
  onReservationConfirmed?: (reservation: Reservation) => void;
}

export function ReservationTable({ reservations, onReservationConfirmed }: ReservationTableProps) {
  const { updateReservationStatus, deleteReservation } = useReservations();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    await updateReservationStatus(id, status);
    
    // Quando una prenotazione viene confermata, notifichiamo il componente genitore
    if (status === "confirmed" && onReservationConfirmed) {
      const reservation = reservations.find(r => r.id === id);
      if (reservation) {
        onReservationConfirmed(reservation);
      }
    }
  };

  const handleDelete = (id: string) => {
    deleteReservation(id);
    setDeleteConfirmId(null);
  };

  // Versione mobile: usa le card senza cestino
  if (isMobile) {
    return (
      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Nessuna prenotazione trovata
          </div>
        ) : (
          reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onUpdateStatus={handleStatusChange}
              onDelete={handleDelete}
              deleteConfirmId={deleteConfirmId}
              onDeleteConfirmChange={setDeleteConfirmId}
              tableNumber={reservation.tableNumber || "-"}
              hideDeletion={true}
            />
          ))
        )}
      </div>
    );
  }

  // Versione desktop: usa la tabella
  return (
    <div className="rounded-md border overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Tavolo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Data e ora</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Persone</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Contatti</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Note</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Stato</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Nessuna prenotazione trovata
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id} className="bg-white">
                  <td className="px-4 py-3 text-sm whitespace-nowrap font-medium">
                    {reservation.tableNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className="font-medium">
                      {reservation.name} {reservation.surname}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div>{format(new Date(reservation.date), "d MMMM yyyy", { locale: it })}</div>
                    <div className="text-muted-foreground text-xs">{reservation.time}</div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{reservation.people}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>{reservation.email}</div>
                    <div className="text-muted-foreground text-xs">{reservation.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                    {reservation.notes || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Azioni</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(reservation.id, "confirmed")}
                          disabled={reservation.status === "confirmed"}
                        >
                          Conferma prenotazione
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(reservation.id, "pending")}
                          disabled={reservation.status === "pending"}
                        >
                          Imposta come in attesa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(reservation.id, "rejected")}
                          disabled={reservation.status === "rejected"}
                        >
                          Rifiuta prenotazione
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirmId(reservation.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {deleteConfirmId && (
        <ReservationDeleteDialog
          isOpen={deleteConfirmId !== null}
          onOpenChange={(open) => !open && setDeleteConfirmId(null)}
          onConfirm={() => {
            if (deleteConfirmId) handleDelete(deleteConfirmId);
          }}
          onCancel={() => setDeleteConfirmId(null)}
          reservation={reservations.find(r => r.id === deleteConfirmId)!}
        />
      )}
    </div>
  );
}

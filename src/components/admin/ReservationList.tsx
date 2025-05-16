import { useEffect, useState } from "react";
import { useReservations } from "@/contexts/ReservationContext";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Reservation } from "@/types";
import { format } from "date-fns";

interface ReservationListProps {
  onReservationConfirmed?: (reservation: Reservation) => void;
  onReservationsFiltered?: (reservations: Reservation[]) => void; // Per aggiornare la mappa
}

export function ReservationList({ onReservationConfirmed, onReservationsFiltered }: ReservationListProps) {
  const { reservations, loading, reload } = useReservations();
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Caricamento iniziale
  useEffect(() => {
    if (!isInitialized) {
      reload();
      setIsInitialized(true);
    }
  }, [reload, isInitialized]);

  // Aggiornamento automatico ogni 40s
  useEffect(() => {
    const intervalId = setInterval(() => {
      reload();
      console.log("Prenotazioni aggiornate automaticamente");
    }, 40000);
    return () => clearInterval(intervalId);
  }, [reload]);

  // Filtra le prenotazioni per la data selezionata
  const filteredReservations = selectedDate
    ? reservations.filter(r => format(new Date(r.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : reservations;

  // Informa il genitore per aggiornare la mappa
  useEffect(() => {
    if (onReservationsFiltered) {
      onReservationsFiltered(filteredReservations);
    }
  }, [filteredReservations, onReservationsFiltered]);

  const handleReservationConfirmed = (reservation: Reservation) => {
    if (onReservationConfirmed) {
      onReservationConfirmed(reservation);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="font-medium text-sm">Seleziona una data:</label>
        <input
          type="date"
          value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
          onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            Rimuovi filtro
          </button>
        )}
      </div>

      {/* Skeleton se carica */}
      {loading && !reservations.length ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <ReservationTable
          reservations={filteredReservations}
          onReservationConfirmed={handleReservationConfirmed}
        />
      )}
    </div>
  );
}

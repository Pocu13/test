
import { useEffect, useState } from "react";
import { useReservations } from "@/contexts/ReservationContext";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Reservation } from "@/types";

interface ReservationListProps {
  onReservationConfirmed?: (reservation: Reservation) => void;
}

export function ReservationList({ onReservationConfirmed }: ReservationListProps) {
  const { reservations, loading, reload } = useReservations();
  const [isInitialized, setIsInitialized] = useState(false);

  // Carica le prenotazioni solo una volta all'inizializzazione
  useEffect(() => {
    if (!isInitialized) {
      reload();
      setIsInitialized(true);
    }
  }, [reload, isInitialized]);

  // Ricarica le prenotazioni ogni 40 secondi per vedere le modifiche
  useEffect(() => {
    const intervalId = setInterval(() => {
      reload();
      console.log("Prenotazioni aggiornate automaticamente");
    }, 40000); // 40 secondi come richiesto
    
    return () => clearInterval(intervalId);
  }, [reload]);

  if (loading && !reservations.length) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const handleReservationConfirmed = (reservation: Reservation) => {
    if (onReservationConfirmed) {
      onReservationConfirmed(reservation);
    }
  };

  return (
    <div className="space-y-6">
      <ReservationTable 
        reservations={reservations}
        onReservationConfirmed={handleReservationConfirmed}
      />
    </div>
  );
}

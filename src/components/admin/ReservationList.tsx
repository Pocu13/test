import { useReservations } from "@/contexts/ReservationContext";
import { Reservation } from "@/types";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { useMemo } from "react";
import { format } from "date-fns";

interface ReservationListProps {
  onReservationConfirmed?: (reservation: Reservation) => void;
  selectedDate: Date;
}

export function ReservationList({
  onReservationConfirmed,
  selectedDate,
}: ReservationListProps) {
  const { reservations } = useReservations();

  const filteredReservations = useMemo(() => {
    return reservations
      .filter((res) =>
        format(new Date(res.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [reservations, selectedDate]);

  return (
    <ReservationTable
      reservations={filteredReservations}
      onReservationConfirmed={onReservationConfirmed}
    />
  );
}

import { useReservations } from "@/contexts/ReservationContext";
import { Reservation } from "@/types";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { useMemo } from "react";
import { format } from "date-fns";

interface ReservationListProps {
  onReservationConfirmed?: (reservation: Reservation) => void;
  selectedDate: Date;
  selectedTime: string;
}

export function ReservationList({
  onReservationConfirmed,
  selectedDate,
  selectedTime,
}: ReservationListProps) {
  const { reservations } = useReservations();

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const sameDate =
        format(new Date(res.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
      const sameTime = res.time === selectedTime;
      return sameDate && sameTime;
    });
  }, [reservations, selectedDate, selectedTime]);

  return (
    <ReservationTable
      reservations={filteredReservations}
      onReservationConfirmed={onReservationConfirmed}
    />
  );
}

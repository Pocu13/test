import { ReservationList } from "@/components/admin/ReservationList";
import { SimpleTableMap } from "@/components/admin/SimpleTableMap";
import { useReservations } from "@/contexts/ReservationContext";
import { TableDefinition } from "@/types/table";
import { useState, useMemo } from "react";
import { isSameDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";

export default function ReservationsPage() {
  const {
    reservations,
    updateReservationStatus,
    updateReservationTable,
  } = useReservations();

  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("20:00");

  const isMobile = useIsMobile();

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) =>
      selectedDate ? isSameDay(new Date(r.date), selectedDate) : true
    );
  }, [reservations, selectedDate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestione Prenotazioni</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Selezione Data e Ora */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
            className="rounded-md border"
          />

          <div>
            <label className="text-sm font-medium" htmlFor="time-picker">
              Seleziona un orario:
            </label>
            <select
              id="time-picker"
              className="border rounded-md p-2 text-sm mt-1 w-full"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="20:00">20:00</option>
              <option value="20:30">20:30</option>
              <option value="21:00">21:00</option>
              <option value="21:30">21:30</option>
              <option value="22:00">22:00</option>
              <option value="22:30">22:30</option>
            </select>
          </div>
        </div>

        {/* Mappa + Lista Prenotazioni */}
        <div className="w-full md:w-2/3 flex flex-col gap-4 min-h-[300px]">
          <SimpleTableMap
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            highlightReservation={null}
          />
          <ReservationList
            reservations={filteredReservations}
            onHighlight={() => {}}
            onUpdateStatus={updateReservationStatus}
            onUpdateTable={updateReservationTable}
            highlightId={null}
          />
        </div>
      </div>
    </div>
  );
}

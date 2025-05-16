import { ReservationList } from "@/components/admin/ReservationList";
import { SimpleTableMap } from "@/components/admin/SimpleTableMap";
import { SimpleReservationForm } from "@/components/admin/SimpleReservationForm";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/contexts/ReservationContext";
import { TableDefinition } from "@/types/table";
import { Reservation } from "@/types";
import { useState, useEffect, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw, PlusIcon } from "lucide-react";
import { MobileReservationForm } from "@/components/admin/MobileReservationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";

export default function ReservationsPage() {
  const {
    reservations,
    loading,
    addReservation,
    reload,
    updateReservationStatus,
    updateReservationTable,
  } = useReservations();

  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightReservation, setHighlightReservation] = useState<string | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
        {/* SEZIONE CALENDARIO E ORARIO */}
        <div className="flex flex-col gap-4 w-full md:w-auto">
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

        {/* SEZIONE MAPPA + LISTA PRENOTAZIONI */}
        <div className="flex-1 flex flex-col gap-4">
          <SimpleTableMap
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            highlightReservation={highlightReservation}
          />
          <ReservationList
            reservations={filteredReservations}
            onHighlight={setHighlightReservation}
            onUpdateStatus={updateReservationStatus}
            onUpdateTable={updateReservationTable}
            highlightId={highlightReservation}
          />
        </div>
      </div>
    </div>
  );
}

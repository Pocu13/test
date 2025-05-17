import { ReservationList } from "@/components/admin/ReservationList";
import { SimpleTableMap } from "@/components/admin/SimpleTableMap";
import { SimpleReservationForm } from "@/components/admin/SimpleReservationForm";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/contexts/ReservationContext";
import { TableDefinition } from "@/types/table";
import { Reservation } from "@/types";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw, PlusIcon } from "lucide-react";
import { MobileReservationForm } from "@/components/admin/MobileReservationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";

export default function ReservationsPage() {
  const { reservations, loading, addReservation, reload, updateReservationStatus } = useReservations();
  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightReservation, setHighlightReservation] = useState<string | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();

  const availableTimes = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];

  const handleTableSelect = (table: TableDefinition) => {
    const isTableOccupied = reservations.some(res =>
      res.tableId === table.id &&
      format(new Date(res.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") &&
      (res.status === "pending" || res.status === "confirmed")
    );

    if (isTableOccupied) {
      toast({
        title: "Tavolo non disponibile",
        description: `Il tavolo ${table.number} è occupato per questa data.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedTable(table);
  };

  const handleCreateReservation = async (formData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    people: number;
    notes: string;
    time: string;
  }) => {
    setIsSubmitting(true);

    try {
      const newReservation = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        date: selectedDate,
        time: formData.time,
        people: formData.people,
        notes: formData.notes || ""
      };

      let tableInfo;
      if (selectedTable) {
        tableInfo = {
          tableId: selectedTable.id,
          tableNumber: selectedTable.number
        };
      }

      const reservation = await addReservation(newReservation, tableInfo);

      if (reservation) {
        await updateReservationStatus(reservation.id, "confirmed");
        toast({
          title: "Prenotazione confermata",
          description: `Prenotazione creata${tableInfo ? ` e assegnata al tavolo ${tableInfo.tableNumber}` : ''}`,
        });
      }

      setSelectedTable(null);
      if (isMobile) setMobileDialogOpen(false);
      await reload();
    } catch (error) {
      console.error("Errore:", error);
      toast({
        title: "Errore",
        description: "Errore nella creazione della prenotazione.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservationStatusChange = async (reservation: Reservation) => {
    setHighlightReservation(reservation.id);
    setTimeout(() => setHighlightReservation(null), 2000);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      reload();
    }, 40000);
    return () => clearInterval(intervalId);
  }, [reload]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Prenotazioni</h1>
        <Button
          onClick={() => {
            setRefreshing(true);
            reload().finally(() => setRefreshing(false));
          }}
          variant="outline"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Aggiornamento..." : "Aggiorna prenotazioni"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">Piantina tavoli</h3>
            <SimpleTableMap
              reservations={reservations.filter(r =>
                format(new Date(r.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
              )}
              onTableSelect={handleTableSelect}
              selectedTableId={selectedTable?.id}
              highlightReservation={highlightReservation}
            />
          </div>

          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">Elenco prenotazioni</h3>
            <ReservationList
              onReservationConfirmed={handleReservationStatusChange}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        <div>
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">
              {selectedTable
                ? `Nuova prenotazione per tavolo ${selectedTable.label || "TAV." + selectedTable.number}`
                : "Nuova prenotazione"}
            </h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border mb-4"
            />

            <SimpleReservationForm
              selectedTable={selectedTable}
              onSubmit={handleCreateReservation}
              isSubmitting={isSubmitting}
              alwaysVisible={true}
              availableTimes={availableTimes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { ReservationList } from "@/components/admin/ReservationList";
import { SimpleTableMap } from "@/components/admin/SimpleTableMap";
import { SimpleReservationForm } from "@/components/admin/SimpleReservationForm";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/contexts/ReservationContext";
import { TableDefinition } from "@/types/table";
import { Reservation } from "@/types";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw, PlusIcon, ZoomIn, ZoomOut } from "lucide-react";
import { MobileReservationForm } from "@/components/admin/MobileReservationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export default function ReservationsPage() {
  const { reservations, loading, addReservation, reload, updateReservationStatus, updateReservationTable } = useReservations();
  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightReservation, setHighlightReservation] = useState<string | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [zoom, setZoom] = useState<number>(1); // MODIFICA: aggiunto stato zoom
  const isMobile = useIsMobile();

  const handleTableSelect = (table: TableDefinition) => {
    const isTableOccupied = reservations.some(res => 
      res.tableId === table.id && 
      (res.status === "pending" || res.status === "confirmed")
    );
    
    if (isTableOccupied) {
      toast({
        title: "Tavolo non disponibile",
        description: `Il tavolo ${table.number} è occupato e non può essere selezionato`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedTable(table);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleCreateReservation = async (formData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    people: number;
    notes: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      const newReservation = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        date: selectedDate,
        time: "20:00", // orario predefinito
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
      console.error("Errore durante la creazione della prenotazione:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della prenotazione.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservationStatusChange = async (reservation: Reservation) => {
    setHighlightReservation(reservation.id);
    setTimeout(() => {
      setHighlightReservation(null);
    }, 2000);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      reload();
    }, 40000);
    return () => clearInterval(intervalId);
  }, [reload]);

  if (isMobile) {
    // Versione mobile omessa per brevità
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Prenotazioni</h1>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw size={16} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Aggiornamento..." : "Aggiorna prenotazioni"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative border rounded-md p-4 bg-white h-[400px]"> {/* MODIFICA: altezza mappa */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Piantina tavoli</h3>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-hidden h-full">
              <SimpleTableMap
                reservations={reservations}
                onTableSelect={handleTableSelect}
                selectedTableId={selectedTable?.id}
                highlightReservation={highlightReservation}
                zoom={zoom} // MODIFICA: passaggio zoom
              />
            </div>
          </div>

          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">Elenco prenotazioni</h3>
            <ReservationList
              onReservationConfirmed={handleReservationStatusChange}
              selectedDate={selectedDate} // per il filtro
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </div>

            <SimpleReservationForm
              selectedTable={selectedTable}
              onSubmit={handleCreateReservation}
              isSubmitting={isSubmitting}
              alwaysVisible={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

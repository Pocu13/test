import { ReservationList } from "@/components/admin/ReservationList";
import { SimpleTableMap } from "@/components/admin/SimpleTableMap";
import { SimpleReservationForm } from "@/components/admin/SimpleReservationForm";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/contexts/ReservationContext";
import { TableDefinition } from "@/types/table";
import { Reservation } from "@/types";
import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw, PlusIcon } from "lucide-react";
import { MobileReservationForm } from "@/components/admin/MobileReservationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

export default function ReservationsPage() {
  const { reservations, loading, addReservation, reload, updateReservationStatus, updateReservationTable } = useReservations();
  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightReservation, setHighlightReservation] = useState<string | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("20:00");
  const isMobile = useIsMobile();

  const availableTimes = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];

  // Filtra le prenotazioni in base alla data e all'orario selezionati
  const filteredReservations = reservations.filter(reservation => {
    const isSameDate = isSameDay(new Date(reservation.date), selectedDate);
    const isSameTime = reservation.time === selectedTime;
    return isSameDate && isSameTime;
  });

  const handleTableSelect = (table: TableDefinition) => {
    const isTableOccupied = filteredReservations.some(res => 
      res.tableId === table.id && 
      (res.status === "pending" || res.status === "confirmed")
    );
    
    if (isTableOccupied) {
      toast({
        title: "Tavolo non disponibile",
        description: `Il tavolo ${table.number} è occupato per la data/ora selezionata`,
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
        time: selectedTime,
        people: formData.people,
        notes: formData.notes || ""
      };
      
      let tableInfo;
      
      if (selectedTable) {
        tableInfo = {
          tableId: selectedTable.id,
          tableNumber: selectedTable.number
        };
        console.log(`Tavolo selezionato manualmente: ${selectedTable.number} (${selectedTable.id})`);
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
      
      if (isMobile) {
        setMobileDialogOpen(false);
      }
      
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

  // Aggiorna automaticamente le prenotazioni quando cambia la data o l'orario
  useEffect(() => {
    reload();
  }, [selectedDate, selectedTime, reload]);

  // Versione mobile
  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestione Prenotazioni</h1>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Aggiornamento..." : "Aggiorna"}
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Orario</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona orario" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="relative">
          <div className="border rounded-md p-4 bg-white mb-4">
            <h3 className="text-lg font-medium mb-4">Piantina tavoli</h3>
            <SimpleTableMap 
              reservations={filteredReservations}
              onTableSelect={handleTableSelect}
              selectedTableId={selectedTable?.id}
              highlightReservation={highlightReservation}
            />
          </div>
          
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">Elenco prenotazioni</h3>
            <ReservationList 
              reservations={filteredReservations}
              onReservationConfirmed={handleReservationStatusChange} 
            />
          </div>
          
          <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-restaurant-500 hover:bg-restaurant-600 shadow-lg"
              >
                <PlusIcon size={24} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <MobileReservationForm
                onSubmit={handleCreateReservation}
                isSubmitting={isSubmitting}
                onCancel={() => setMobileDialogOpen(false)}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                availableTimes={availableTimes}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Versione desktop
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Prenotazioni</h1>
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Aggiornamento..." : "Aggiorna prenotazioni"}
        </Button>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Orario</label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona orario" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map(time => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">Piantina tavoli</h3>
            <SimpleTableMap 
              reservations={filteredReservations}
              onTableSelect={handleTableSelect}
              selectedTableId={selectedTable?.id}
              highlightReservation={highlightReservation}
            />
          </div>
          
          <div className="border rounded-md p-4 bg-white">
            <h3 className="text-lg font-medium mb-4">Elenco prenotazioni</h3>
            <ReservationList 
              reservations={filteredReservations}
              onReservationConfirmed={handleReservationStatusChange} 
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

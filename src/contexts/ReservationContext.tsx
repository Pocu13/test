
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Reservation, ReservationStatus } from "@/types";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useRestaurantSettings } from "@/contexts/SettingsContext";
import { useSupabaseReservations } from "@/hooks/useSupabaseReservations";
import { getReservationsForDate, findAvailableTableForReservation, isTableNumberAvailable } from "@/utils/reservationUtils";
import { useToast } from "@/components/ui/use-toast";
import { tableDefinitions } from "@/data/tableDefinitions";
import { v4 as uuidv4 } from 'uuid';

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, "id" | "status" | "createdAt" | "tableId" | "tableNumber">, tableInfo?: { tableId: string; tableNumber: number }) => Promise<Reservation | null>;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
  updateReservationTable: (id: string, tableNumber: number) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  hasActiveReservation: (email: string) => boolean;
  loading: boolean;
  reload: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const { settings, isLoaded } = useRestaurantSettings();
  const { toast } = useToast();
  const {
    reservations,
    loading,
    fetchReservations,
    addReservation: addReservationToSupabase,
    updateReservationStatus: updateReservationStatusInSupabase,
    updateReservationTable: updateReservationTableInSupabase,
    deleteReservation: deleteReservationFromSupabase
  } = useSupabaseReservations();
  
  // Flag per controllare se abbiamo già caricato i dati
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded && !dataLoaded) {
      fetchReservations().then(() => {
        setDataLoaded(true);
      });
    }
  }, [isLoaded, dataLoaded, fetchReservations]);

  const addReservation = async (
    newReservation: Omit<Reservation, "id" | "status" | "createdAt" | "tableId" | "tableNumber">,
    tableInfo?: { tableId: string; tableNumber: number }
  ): Promise<Reservation | null> => {
    try {
      // Verificare la disponibilità generale
      const reservationsForDate = getReservationsForDate(reservations, newReservation.date);
      const totalPeopleForDate = reservationsForDate.reduce((acc, res) => acc + res.people, 0);
      
      if (totalPeopleForDate + newReservation.people > settings.availableSeats) {
        toast({
          title: "Prenotazione non disponibile",
          description: "Spiacenti, non ci sono abbastanza posti disponibili per questa data.",
          variant: "destructive",
        });
        return null;
      }

      // Se non è stato specificato un tavolo, trovane uno disponibile
      let finalTableInfo = tableInfo;
      
      if (!finalTableInfo) {
        console.log("Ricerca di un tavolo disponibile per", newReservation.people, "persone");
        
        // Cerca un tavolo disponibile in base al numero di persone
        const availableTable = findAvailableTableForReservation(
          newReservation.people,
          tableDefinitions,
          reservations
        );

        if (availableTable) {
          // Crea un UUID valido per il tavolo
          const validUuid = uuidv4();
          
          finalTableInfo = {
            tableId: validUuid,
            tableNumber: availableTable.number
          };
          
          console.log(`Tavolo assegnato automaticamente: ${availableTable.number} con UUID: ${validUuid}`);
        } else {
          console.log("Nessun tavolo disponibile per questa prenotazione");
          toast({
            title: "Nessun tavolo disponibile",
            description: "Non è stato possibile trovare un tavolo disponibile per il numero di persone richiesto.",
            variant: "destructive",
          });
          return null;
        }
      } else {
        // Verifica se il tavolo specificato è disponibile
        if (!isTableNumberAvailable(finalTableInfo.tableNumber, reservations)) {
          toast({
            title: "Tavolo non disponibile",
            description: `Il tavolo ${finalTableInfo.tableNumber} è già occupato.`,
            variant: "destructive",
          });
          return null;
        }
        
        // Se l'ID del tavolo fornito non è un UUID valido, ne generiamo uno nuovo
        try {
          // Corretto: verifichiamo se è un UUID valido usando una regex
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(finalTableInfo.tableId)) {
            throw new Error("UUID non valido");
          }
        } catch (e) {
          // Non è un UUID valido, genera un nuovo UUID
          const validUuid = uuidv4();
          finalTableInfo = {
            tableId: validUuid,
            tableNumber: finalTableInfo.tableNumber
          };
          console.log(`Generato nuovo UUID valido per il tavolo: ${validUuid}`);
        }
      }
      
      // Invio prenotazione al database
      console.log("Invio prenotazione al database:", newReservation);
      console.log("Informazioni tavolo:", finalTableInfo);
      
      const reservation = await addReservationToSupabase(newReservation, finalTableInfo);
      
      if (reservation) {
        toast({
          title: "Prenotazione ricevuta",
          description: "La tua richiesta è in attesa di conferma",
        });

        console.log(`Email inviata a ${newReservation.email}: Prenotazione ricevuta per ${format(newReservation.date, "d MMMM yyyy", { locale: it })} alle ${newReservation.time}`);
        await fetchReservations(); // Ricarica le prenotazioni per aggiornare lo stato dei tavoli
        return reservation;
      }
      
      return null;
    } catch (error) {
      console.error("Errore durante l'aggiunta della prenotazione:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della prenotazione",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      const success = await updateReservationStatusInSupabase(id, status);
      
      if (success) {
        const reservation = reservations.find(r => r.id === id);
        if (reservation) {
          if (status === "confirmed") {
            console.log(`Email inviata a ${reservation.email}: La tua prenotazione per ${format(reservation.date, "d MMMM yyyy", { locale: it })} alle ${reservation.time} è stata confermata`);
          } else if (status === "rejected") {
            console.log(`Email inviata a ${reservation.email}: Ci dispiace, ma la tua prenotazione per ${format(reservation.date, "d MMMM yyyy", { locale: it })} alle ${reservation.time} non può essere accettata`);
          }
        }

        toast({
          title: "Stato aggiornato",
          description: "Lo stato della prenotazione è stato aggiornato",
        });
        
        await fetchReservations(); // Ricarica le prenotazioni per aggiornare lo stato dei tavoli
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dello stato:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato",
        variant: "destructive",
      });
    }
  };

  const updateReservationTable = async (id: string, tableNumber: number) => {
    try {
      // Controlla se il tavolo è disponibile
      if (!isTableNumberAvailable(tableNumber, reservations.filter(r => r.id !== id))) {
        toast({
          title: "Tavolo non disponibile",
          description: `Il tavolo ${tableNumber} è già occupato.`,
          variant: "destructive",
        });
        return;
      }
    
      // Crea un UUID valido per il nuovo tableId
      const tableId = uuidv4();
      
      const success = await updateReservationTableInSupabase(id, tableNumber, tableId);
      
      if (success) {
        toast({
          title: "Tavolo assegnato",
          description: `Il tavolo ${tableNumber} è stato assegnato alla prenotazione`,
        });
        
        await fetchReservations(); // Ricarica le prenotazioni per aggiornare lo stato dei tavoli
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del tavolo:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'assegnazione del tavolo",
        variant: "destructive",
      });
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const success = await deleteReservationFromSupabase(id);
      
      if (success) {
        toast({
          title: "Prenotazione eliminata",
          description: "La prenotazione è stata eliminata con successo",
        });
        
        await fetchReservations(); // Ricarica le prenotazioni per aggiornare lo stato dei tavoli
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione",
        variant: "destructive",
      });
    }
  };

  const hasActiveReservation = (email: string) => {
    return reservations.some(res => 
      res.email.toLowerCase() === email.toLowerCase() && 
      (res.status === "pending" || res.status === "confirmed")
    );
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      addReservation, 
      updateReservationStatus,
      updateReservationTable,
      deleteReservation,
      hasActiveReservation,
      loading,
      reload: fetchReservations
    }}>
      {children}
    </ReservationContext.Provider>
  );
}

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservations deve essere utilizzato all'interno di un ReservationProvider");
  }
  return context;
};

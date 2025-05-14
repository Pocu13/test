
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reservation, ReservationStatus } from "@/types";
import { parseReservationFromSupabase, formatReservationForSupabase } from "@/utils/reservationUtils";
import { useToast } from "@/hooks/use-toast";

export const useSupabaseReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Errore nel caricamento delle prenotazioni:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le prenotazioni",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        const parsedReservations = data.map(parseReservationFromSupabase);
        setReservations(parsedReservations);
        console.log("Prenotazioni caricate:", parsedReservations.length);
      }
    } catch (err) {
      console.error("Errore in fetchReservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const addReservation = async (newReservation: Omit<Reservation, "id" | "status" | "createdAt" | "tableId" | "tableNumber">, tableInfo?: { tableId: string; tableNumber: number }) => {
    try {
      // Prepara i dati per Supabase
      const reservationData = formatReservationForSupabase(newReservation, tableInfo);
      
      console.log("Invio dati prenotazione a Supabase:", reservationData);
      
      const { data, error } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select();
      
      if (error) {
        console.error('Errore nel salvare la prenotazione:', error);
        toast({
          title: "Errore",
          description: `Impossibile salvare la prenotazione: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }
      
      if (data && data.length > 0) {
        console.log("Prenotazione salvata con successo:", data[0]);
        const reservation = parseReservationFromSupabase(data[0]);
        setReservations(prev => [reservation, ...prev]);
        toast({
          title: "Prenotazione ricevuta",
          description: "La tua richiesta è stata inviata con successo",
        });
        return reservation;
      } else {
        console.error('Nessun dato restituito dopo l\'inserimento');
        toast({
          title: "Errore",
          description: "Impossibile salvare la prenotazione: nessun dato restituito",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Errore in addReservation:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto durante il salvataggio",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('Errore nell\'aggiornamento dello stato della prenotazione:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare lo stato della prenotazione",
          variant: "destructive"
        });
        return false;
      }
      
      // Aggiorna lo stato locale per evitare di ricaricare
      setReservations(prevReservations =>
        prevReservations.map(res => 
          res.id === id ? { ...res, status } : res
        )
      );
      
      return true;
    } catch (error) {
      console.error('Errore in updateReservationStatus:', error);
      return false;
    }
  };

  const updateReservationTable = async (id: string, tableNumber: number, tableId: string) => {
    try {
      console.log(`Aggiornamento della prenotazione ${id} con numero tavolo ${tableNumber} e tableId ${tableId}`);
      
      const { error } = await supabase
        .from('reservations')
        .update({ 
          table_id: tableId,
          table_number: tableNumber 
        })
        .eq('id', id);
      
      if (error) {
        console.error('Errore nell\'aggiornamento del tavolo della prenotazione:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare il tavolo della prenotazione",
          variant: "destructive"
        });
        return false;
      }
      
      // Aggiorna lo stato locale per evitare di ricaricare
      setReservations(prevReservations =>
        prevReservations.map(res => 
          res.id === id ? { ...res, tableId, tableNumber } : res
        )
      );
      
      return true;
    } catch (error) {
      console.error('Errore in updateReservationTable:', error);
      return false;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Errore nell\'eliminazione della prenotazione:', error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare la prenotazione",
          variant: "destructive"
        });
        return false;
      }
      
      // Aggiorna lo stato locale per evitare di ricaricare
      setReservations(prev => prev.filter(res => res.id !== id));
      return true;
    } catch (error) {
      console.error('Errore in deleteReservation:', error);
      return false;
    }
  };

  return {
    reservations,
    loading,
    fetchReservations,
    addReservation,
    updateReservationStatus,
    updateReservationTable,
    deleteReservation
  };
};

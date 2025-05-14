import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReservations } from "@/contexts/ReservationContext";
import { useRestaurantSettings } from "@/contexts/SettingsContext";
import { CustomerForm } from "./reservation/CustomerForm";
import { DateTimePicker } from "./reservation/DateTimePicker";
import { PeopleAndNotes } from "./reservation/PeopleAndNotes";
import { ValidationError } from "./reservation/ValidationError";

interface AddReservationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReservationDialog({
  isOpen,
  onOpenChange
}: AddReservationDialogProps) {
  const { addReservation, hasActiveReservation, reservations } = useReservations();
  const { settings } = useRestaurantSettings();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("19:30");
  const [people, setPeople] = useState(2);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  
  // Generate available time slots based on selected date and settings
  useEffect(() => {
    if (!date) return;
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    
    // Find opening schedule for this day
    const daySchedule = settings.openingDays.find(day => day.day === dayOfWeek);
    
    if (!daySchedule || !daySchedule.enabled) {
      // Restaurant is closed on this day
      setTimeOptions([]);
      setValidationError("Il ristorante è chiuso in questo giorno");
      return;
    }
    
    // Restaurant is open, create 30-minute time slots from opening to closing time
    const startParts = daySchedule.start.split(":");
    const endParts = daySchedule.end.split(":");
    
    if (startParts.length !== 2 || endParts.length !== 2) {
      console.error("Invalid time format in settings");
      return;
    }
    
    const startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1]);
    const endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1]);
    
    const times: string[] = [];
    
    let hour = startHour;
    let minute = startMinute;
    
    // Generate time slots in 30-minute intervals
    while (hour < endHour || (hour === endHour && minute <= endMinute - 30)) {
      times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      
      // Advance by 30 minutes
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    
    setTimeOptions(times);
    
    // If there are time options, clear validation error and set default time
    if (times.length > 0) {
      setValidationError(null);
      setTime(times[0]); // Select first available time slot
    } else {
      setValidationError("Nessun orario disponibile per questo giorno");
    }
  }, [date, settings.openingDays]);
  
  const resetForm = () => {
    setName("");
    setSurname("");
    setEmail("");
    setPhone("");
    setDate(new Date());
    setTime("19:30");
    setPeople(2);
    setNotes("");
    setIsSubmitting(false);
    setValidationError(null);
  };
  
  const handleSubmit = async () => {
    if (!date || !name || !surname || !email || !phone || !time || !people) {
      setValidationError("Tutti i campi obbligatori devono essere compilati");
      return;
    }
    
    // Check if restaurant is open on this day
    const dayOfWeek = date.getDay();
    const daySchedule = settings.openingDays.find(day => day.day === dayOfWeek);
    
    if (!daySchedule || !daySchedule.enabled) {
      setValidationError("Il ristorante è chiuso in questo giorno");
      return;
    }
    
    // Check if selected time is within opening hours
    if (!timeOptions.includes(time)) {
      setValidationError("L'orario selezionato non è disponibile");
      return;
    }
    
    // Check if there's sufficient capacity
    const reservationsForDate = reservations.filter(res => 
      res.date.toDateString() === date.toDateString() && 
      (res.status === "pending" || res.status === "confirmed")
    );
    
    const totalPeopleForDate = reservationsForDate.reduce((acc, res) => acc + res.people, 0);
    
    if (totalPeopleForDate + people > settings.availableSeats) {
      setValidationError(`Non ci sono abbastanza posti disponibili. Rimasti: ${Math.max(0, settings.availableSeats - totalPeopleForDate)} posti`);
      return;
    }
    
    // Check if customer already has an active reservation
    if (hasActiveReservation(email)) {
      setValidationError("Questo cliente ha già una prenotazione attiva");
      return;
    }
    
    setIsSubmitting(true);
    setValidationError(null);
    
    try {
      await addReservation({
        name,
        surname,
        email,
        phone,
        date,
        time,
        people,
        notes
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Errore durante l'aggiunta della prenotazione:", error);
      setValidationError("Si è verificato un errore durante il salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi prenotazione</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli per creare una nuova prenotazione direttamente dall'admin.
          </DialogDescription>
        </DialogHeader>
        
        <ValidationError error={validationError} />
        
        <div className="w-full space-y-4">
          <CustomerForm 
            name={name}
            surname={surname}
            email={email}
            phone={phone}
            setName={setName}
            setSurname={setSurname}
            setEmail={setEmail}
            setPhone={setPhone}
          />
          
          <DateTimePicker 
            date={date}
            time={time}
            setDate={setDate}
            setTime={setTime}
            timeOptions={timeOptions}
            openingDays={settings.openingDays}
          />
          
          <PeopleAndNotes 
            people={people}
            notes={notes}
            setPeople={setPeople}
            setNotes={setNotes}
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !name || !surname || !email || !phone || !date || !time || !people || timeOptions.length === 0}
            className="bg-restaurant-500 hover:bg-restaurant-600"
          >
            {isSubmitting ? "Salvataggio..." : "Salva prenotazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

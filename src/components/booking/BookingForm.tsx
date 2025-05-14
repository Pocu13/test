
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StepPeople } from "@/components/booking/StepPeople";
import { StepDateTime } from "@/components/booking/StepDateTime";
import { StepDetails } from "@/components/booking/StepDetails";
import { StepConfirmation } from "@/components/booking/StepConfirmation";
import { Reservation } from "@/types";
import { useReservations } from "@/contexts/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import { BookingStepsIndicator } from "@/components/booking/BookingStepsIndicator";

interface BookingFormProps {
  onStepChange?: (step: number) => void;
}

export function BookingForm({ onStepChange }: BookingFormProps) {
  const { addReservation, reservations, hasActiveReservation } = useReservations();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [reservationData, setReservationData] = useState<Partial<Reservation>>({});
  const { toast } = useToast();

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePeopleSubmit = (people: number) => {
    if (people > 12) {
      toast({
        title: "Numero di persone non valido",
        description: "Non è possibile prenotare per più di 12 persone",
        variant: "destructive",
      });
      return;
    }
    
    setReservationData(prev => ({ ...prev, people }));
    handleNext();
  };

  const handleDateTimeSubmit = (date: Date, time: string) => {
    setReservationData(prev => ({ ...prev, date, time }));
    handleNext();
  };

  const handleDetailsSubmit = (details: { name: string; surname: string; email: string; phone: string; notes: string }) => {
    if (hasActiveReservation(details.email)) {
      toast({
        title: "Prenotazione già esistente",
        description: "Risulta già una prenotazione attiva con questa email",
        variant: "destructive",
      });
      return;
    }
    
    setReservationData(prev => ({ ...prev, ...details }));
    handleNext();
  };

  const handleSubmit = () => {
    if (
      reservationData.name &&
      reservationData.surname &&
      reservationData.email &&
      reservationData.phone &&
      reservationData.date &&
      reservationData.time &&
      reservationData.people
    ) {
      console.log("Inviando prenotazione:", reservationData);
      addReservation({
        name: reservationData.name,
        surname: reservationData.surname,
        email: reservationData.email,
        phone: reservationData.phone,
        date: reservationData.date,
        time: reservationData.time,
        people: reservationData.people,
        notes: reservationData.notes || ""
      });
    } else {
      console.error("Dati prenotazione incompleti:", reservationData);
      toast({
        title: "Errore",
        description: "Dati prenotazione incompleti",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <Card className="overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="px-8 pt-8 pb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Prenota un Tavolo</h2>
            <p className="text-muted-foreground">Segui i passaggi per effettuare la tua prenotazione</p>
          </div>
          
          <div className="px-8 pb-4">
            <BookingStepsIndicator currentStep={currentStep} />
          </div>

          <div className="p-8">
            <div className={`step-content ${currentStep === 1 ? "animate-fade-in block" : "hidden"}`}>
              <StepPeople onSubmit={handlePeopleSubmit} initialValue={reservationData.people} />
            </div>
            <div className={`step-content ${currentStep === 2 ? "animate-fade-in block" : "hidden"}`}>
              <StepDateTime 
                onSubmit={handleDateTimeSubmit} 
                onBack={handleBack}
                initialDate={reservationData.date}
                initialTime={reservationData.time}
              />
            </div>
            <div className={`step-content ${currentStep === 3 ? "animate-fade-in block" : "hidden"}`}>
              <StepDetails 
                onSubmit={handleDetailsSubmit} 
                onBack={handleBack}
                initialValues={{
                  name: reservationData.name || "",
                  surname: reservationData.surname || "",
                  email: reservationData.email || "",
                  phone: reservationData.phone || "",
                  notes: reservationData.notes || ""
                }}
              />
            </div>
            <div className={`step-content ${currentStep === 4 ? "animate-fade-in block" : "hidden"}`}>
              <StepConfirmation
                onSubmit={handleSubmit}
                onBack={handleBack}
                reservation={{
                  name: reservationData.name || "",
                  surname: reservationData.surname || "",
                  email: reservationData.email || "",
                  phone: reservationData.phone || "",
                  date: reservationData.date || new Date(),
                  time: reservationData.time || "",
                  people: reservationData.people || 0,
                  notes: reservationData.notes || ""
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

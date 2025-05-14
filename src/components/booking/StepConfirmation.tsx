
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowLeft, Calendar, Mail, Phone, User, Users, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

interface StepConfirmationProps {
  onSubmit: () => void;
  onBack: () => void;
  reservation: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    date: Date;
    time: string;
    people: number;
    notes: string;
  };
}

export function StepConfirmation({ onSubmit, onBack, reservation }: StepConfirmationProps) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (privacyAccepted && gdprAccepted && !isSubmitted) {
      setIsSubmitting(true);
      console.log("Confermando prenotazione con dati:", reservation);
      try {
        await onSubmit();
        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (!privacyAccepted || !gdprAccepted) {
      alert("È necessario accettare i termini della privacy e del GDPR per procedere");
    }
  };

  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack} 
        className="mb-4 flex items-center text-restaurant-600 hover:text-restaurant-700"
        disabled={isSubmitting || isSubmitted}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        <span>Indietro</span>
      </button>

      <h3 className="text-xl font-medium text-gray-800 mb-2 text-center">
        Riepilogo prenotazione
      </h3>

      <p className="text-center text-muted-foreground mb-6">
        Controlla i dati e conferma la tua prenotazione
      </p>
      
      <Card className="border-restaurant-200 shadow-sm mb-8">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-16 w-16 rounded-full bg-restaurant-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-restaurant-500" />
            </div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-medium">
                {format(reservation.date, "EEEE d MMMM yyyy", { locale: it })}
              </div>
              <div className="text-lg sm:text-xl font-bold text-restaurant-600">
                {reservation.time}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <Users className="h-5 w-5 text-restaurant-500" />
            <div>
              <div className="font-medium">Persone</div>
              <div className="text-muted-foreground">{reservation.people}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <User className="h-5 w-5 text-restaurant-500" />
            <div>
              <div className="font-medium">Nome e cognome</div>
              <div className="text-muted-foreground">
                {reservation.name} {reservation.surname}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <Mail className="h-5 w-5 text-restaurant-500" />
            <div>
              <div className="font-medium">Email</div>
              <div className="text-muted-foreground">{reservation.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <Phone className="h-5 w-5 text-restaurant-500" />
            <div>
              <div className="font-medium">Telefono</div>
              <div className="text-muted-foreground">{reservation.phone}</div>
            </div>
          </div>

          {reservation.notes && (
            <div className="pt-2">
              <div className="font-medium">Note</div>
              <div className="text-muted-foreground mt-1">{reservation.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 mb-6">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="privacy" 
            checked={privacyAccepted} 
            onCheckedChange={(checked) => setPrivacyAccepted(!!checked)} 
            disabled={isSubmitting || isSubmitted}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="privacy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accetto la <Link to="/privacy-policy" className="text-restaurant-600 hover:underline">Privacy Policy</Link>
            </Label>
            <p className="text-xs text-muted-foreground">
              Acconsento al trattamento dei miei dati personali in conformità con la Privacy Policy.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox 
            id="gdpr" 
            checked={gdprAccepted} 
            onCheckedChange={(checked) => setGdprAccepted(!!checked)} 
            disabled={isSubmitting || isSubmitted}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="gdpr"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accetto il <Link to="/gdpr-policy" className="text-restaurant-600 hover:underline">Trattamento dei dati (GDPR)</Link>
            </Label>
            <p className="text-xs text-muted-foreground">
              Confermo di aver letto e compreso il trattamento dei miei dati secondo il regolamento GDPR.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              La tua prenotazione sarà confermata solo dopo la verifica da parte del nostro staff, che ti invierà una email di conferma.
            </p>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleSubmit}
        className="w-full bg-restaurant-500 hover:bg-restaurant-600 text-white"
        disabled={!privacyAccepted || !gdprAccepted || isSubmitting || isSubmitted}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Invio in corso...
          </>
        ) : isSubmitted ? (
          "Prenotazione inviata"
        ) : (
          "Conferma prenotazione"
        )}
      </Button>
    </div>
  );
}

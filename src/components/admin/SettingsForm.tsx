
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRestaurantSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { SettingsFormData, settingsSchema, daysOfWeek } from "@/schemas/settingsSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { OpeningDaysSection } from "./settings/OpeningDaysSection";
import { CapacitySection } from "./settings/CapacitySection";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OpeningDaySchedule } from "@/types";

export function SettingsForm() {
  const { settings, updateSettings, isLoaded, reload } = useRestaurantSettings();
  const { toast } = useToast();
  const [formInitialized, setFormInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Crea form con validazione
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openingDays: daysOfWeek.map(day => ({
        day: day.value,
        enabled: true,
        start: "12:00",
        end: "22:00"
      })),
      availableSeats: 50,
    },
  });

  // Inizializza il form con le impostazioni da Supabase
  useEffect(() => {
    if (isLoaded && settings && !formInitialized) {
      try {
        // Assicurati che tutti i giorni abbiano le proprietà richieste e siano ordinati correttamente
        const formattedOpeningDays = settings.openingDays.map(day => ({
          day: day.day,
          enabled: day.enabled,
          start: day.start,
          end: day.end
        }));

        // Ordina i giorni con lunedì (1) primo, domenica (0) ultima
        formattedOpeningDays.sort((a, b) => {
          if (a.day === 0) return 1; // Domenica alla fine
          if (b.day === 0) return -1;
          return a.day - b.day;
        });

        // Reimposta il form con valori validati
        form.reset({
          openingDays: formattedOpeningDays as OpeningDaySchedule[],
          availableSeats: settings.availableSeats || 50,
        });
        
        setFormInitialized(true);
        console.log("Impostazioni inizializzate:", formattedOpeningDays);
      } catch (error) {
        console.error("Errore nell'inizializzazione delle impostazioni:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le impostazioni",
          variant: "destructive"
        });
      }
    }
  }, [isLoaded, settings, form, formInitialized, toast]);

  // Handler per l'invio del form
  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      // Assicurati che tutti i giorni abbiano le proprietà richieste
      const validatedOpeningDays: OpeningDaySchedule[] = data.openingDays.map(day => ({
        day: day.day,
        enabled: day.enabled,
        start: day.start,
        end: day.end
      }));

      await updateSettings({
        openingDays: validatedOpeningDays,
        availableSeats: data.availableSeats,
      });
      
      toast({
        title: "Impostazioni salvate",
        description: "Le modifiche sono state applicate correttamente",
      });
      
      // Solo refresh della pagina senza redirect
      reload();
      setFormInitialized(false); // Reimposta lo stato del form per caricare dati nuovi
      
      // Facciamo un refresh della homepage in background
      try {
        const homePageUrl = window.location.origin;
        fetch(homePageUrl, { method: 'GET', mode: 'no-cors', cache: 'reload' })
          .then(() => console.log("Homepage refreshed in background"))
          .catch(err => console.error("Error refreshing homepage:", err));
      } catch (error) {
        console.error("Error attempting to refresh homepage:", error);
      }
    } catch (error) {
      console.error("Errore nel salvataggio delle impostazioni:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Stato di caricamento
  if (!isLoaded) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-restaurant-500" />
          <p className="ml-2">Caricamento impostazioni...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Impostazioni Ristorante</CardTitle>
        <CardDescription>
          Configura giorni, orari e capienza. <br /> Valide per tutti gli utenti.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 max-w-full">
              <OpeningDaysSection control={form.control} />
            </div>
            <Separator />
            <CapacitySection control={form.control} />
            <Button 
              type="submit" 
              className="bg-restaurant-500 hover:bg-restaurant-600 w-full text-lg"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : "Salva impostazioni"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

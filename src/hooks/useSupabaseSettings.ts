
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantSettings, OpeningDaySchedule } from "@/types";
import { daysOfWeek } from "@/schemas/settingsSchema";

const SETTINGS_TABLE = "restaurant_settings";

/**
 * Hook per gestire le impostazioni del ristorante con Supabase
 */
export function useSupabaseSettings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Configurazione predefinita delle impostazioni
  const getDefaultSettings = (): RestaurantSettings => {
    return {
      openingDays: daysOfWeek.map(day => ({
        day: day.value,
        enabled: true, // Per impostazione predefinita, tutti i giorni sono abilitati
        start: "12:00",
        end: "22:00"
      })),
      availableSeats: 50
    };
  };

  // Carica le impostazioni da Supabase
  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from(SETTINGS_TABLE)
        .select("data")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Errore nel caricamento impostazioni:", error);
        throw error;
      }

      if (data?.data) {
        const settingsData = data.data as any;
        
        // Elabora i giorni di apertura per garantire una struttura corretta
        let openingDays: OpeningDaySchedule[] = [];
        
        if (Array.isArray(settingsData.openingDays) && settingsData.openingDays.length > 0) {
          // Mappa e convalida ogni voce del giorno
          openingDays = settingsData.openingDays.map((day: any): OpeningDaySchedule => ({
            day: typeof day.day === 'number' ? day.day : 0,
            enabled: typeof day.enabled === 'boolean' ? day.enabled : true,
            start: typeof day.start === 'string' ? day.start : "12:00",
            end: typeof day.end === 'string' ? day.end : "22:00"
          }));
          
          // Ordina i giorni con lunedì (1) primo, domenica (0) ultima
          openingDays.sort((a, b) => {
            if (a.day === 0) return 1; // La domenica va alla fine
            if (b.day === 0) return -1;
            return a.day - b.day;
          });
          
          // Assicurati di avere esattamente 7 giorni
          if (openingDays.length !== 7) {
            openingDays = getDefaultSettings().openingDays;
          }
        } else {
          // Usa i valori predefiniti se non ci sono giorni di apertura validi
          openingDays = getDefaultSettings().openingDays;
        }
        
        // Costruisci le impostazioni convalidate
        const validatedSettings: RestaurantSettings = {
          openingDays,
          availableSeats: typeof settingsData.availableSeats === 'number' ? 
            settingsData.availableSeats : 50
        };
        
        setSettings(validatedSettings);
        console.log("Impostazioni caricate:", validatedSettings);
      } else {
        // Nessuna impostazione trovata, utilizzare quelle predefinite
        const defaultSettings = getDefaultSettings();
        setSettings(defaultSettings);
        console.log("Utilizzo impostazioni predefinite:", defaultSettings);
      }
    } catch (error) {
      console.error("Errore nell'analisi delle impostazioni:", error);
      // Imposta le impostazioni predefinite in caso di errore
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  // Salva le impostazioni su Supabase
  const saveSettings = useCallback(
    async (newSettings: RestaurantSettings) => {
      try {
        // Convalida i giorni di apertura prima di salvare
        const validatedOpeningDays: OpeningDaySchedule[] = newSettings.openingDays.map(
          (day): OpeningDaySchedule => ({
            day: typeof day.day === 'number' ? day.day : 0,
            enabled: typeof day.enabled === 'boolean' ? day.enabled : true,
            start: typeof day.start === 'string' ? day.start : "12:00",
            end: typeof day.end === 'string' ? day.end : "22:00"
          })
        );
        
        // Ordina i giorni con il lunedì per primo
        validatedOpeningDays.sort((a, b) => {
          if (a.day === 0) return 1; // Domenica alla fine
          if (b.day === 0) return -1;
          return a.day - b.day;
        });

        const validatedSettings: RestaurantSettings = {
          openingDays: validatedOpeningDays,
          availableSeats: typeof newSettings.availableSeats === 'number' ? 
            newSettings.availableSeats : 50
        };

        // Trova le impostazioni esistenti o ne crea di nuove
        const { data: current, error: fetchError } = await supabase
          .from(SETTINGS_TABLE)
          .select("id")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          console.error("Errore nel recupero delle impostazioni esistenti:", fetchError);
          throw fetchError;
        }

        // Converti RestaurantSettings in un oggetto JSON semplice per Supabase
        const plainOpeningDays = validatedSettings.openingDays.map(day => ({
          day: day.day,
          enabled: day.enabled,
          start: day.start,
          end: day.end
        }));

        const settingsForDb = {
          openingDays: plainOpeningDays,
          availableSeats: validatedSettings.availableSeats
        };

        // Aggiorna o inserisci le impostazioni
        let response;
        if (current?.id) {
          response = await supabase
            .from(SETTINGS_TABLE)
            .update({ 
              data: settingsForDb,
              updated_at: new Date().toISOString() 
            })
            .eq("id", current.id);
        } else {
          response = await supabase
            .from(SETTINGS_TABLE)
            .insert({ 
              data: settingsForDb
            });
        }

        if (response.error) {
          console.error("Errore nel salvataggio delle impostazioni:", response.error);
          throw response.error;
        }

        // Aggiorna lo stato
        setSettings(validatedSettings);
        return response;
      } catch (error) {
        console.error("Errore durante il salvataggio:", error);
        throw error;
      }
    },
    [],
  );

  return { 
    settings, 
    loadSettings, 
    saveSettings, 
    loading, 
    setSettings,
    getDefaultSettings
  };
}

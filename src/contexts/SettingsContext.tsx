
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { RestaurantSettings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseSettings } from "@/hooks/useSupabaseSettings";

interface SettingsContextType {
  settings: RestaurantSettings;
  updateSettings: (newSettings: RestaurantSettings) => Promise<void>;
  isLoaded: boolean;
  reload: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    settings,
    loadSettings,
    saveSettings,
    loading,
    setSettings,
    getDefaultSettings
  } = useSupabaseSettings();

  const [isLoaded, setIsLoaded] = useState(false);

  // Caricamento iniziale delle impostazioni
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await loadSettings();
        setIsLoaded(true);
      } catch (error) {
        console.error("Errore nel caricamento impostazioni:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le impostazioni del ristorante",
          variant: "destructive"
        });
      }
    };
    fetchSettings();
  }, [loadSettings, toast]);

  // Assicuriamoci di avere sempre impostazioni valide
  const safeSettings = settings || getDefaultSettings();

  const updateSettings = async (newSettings: RestaurantSettings) => {
    try {
      console.log("Tentativo di salvare impostazioni:", newSettings);
      await saveSettings(newSettings);
      toast({
        title: "Impostazioni aggiornate",
        description: "Le modifiche sono state salvate correttamente.",
      });
    } catch (error) {
      console.error("Errore aggiornamento impostazioni:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive"
      });
    }
  };

  const reload = () => {
    setIsLoaded(false);
    loadSettings().then(() => setIsLoaded(true));
  };

  return (
    <SettingsContext.Provider value={{ 
      settings: safeSettings, 
      updateSettings, 
      isLoaded: isLoaded && !loading, 
      reload 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useRestaurantSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useRestaurantSettings deve essere usato all'interno di un SettingsProvider");
  }
  return context;
};

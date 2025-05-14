
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { daysOfWeek } from "@/schemas/settingsSchema";
import { Control } from "react-hook-form";
import { useFieldArray, useFormContext } from "react-hook-form";
import { SettingsFormData } from "@/schemas/settingsSchema";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

interface OpeningDaysSectionProps {
  control: Control<SettingsFormData>;
}

export function OpeningDaysSection({ control }: OpeningDaysSectionProps) {
  // Use react-hook-form useFieldArray to manage the array of days
  const { fields } = useFieldArray({
    control,
    name: "openingDays"
  });
  
  // Get form context to use setValue
  const { setValue, watch } = useFormContext<SettingsFormData>();
  const openingDays = watch("openingDays");
  
  // Check if on mobile device
  const isMobile = useIsMobile();

  return (
    <div>
      <h3 className="text-lg font-medium">Giorni e Orari di Apertura</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Modifica orario specifico per ogni giorno e seleziona quali giorni sono aperti.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {fields.map((field, idx) => {
          // Find the corresponding day in the days of week
          const currentDay = openingDays[idx];
          const dayInfo = daysOfWeek.find(d => d.value === currentDay.day) || daysOfWeek[0];
          
          return (
            <FormItem
              key={field.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <FormControl>
                  <Switch
                    checked={currentDay.enabled}
                    onCheckedChange={(checked) => {
                      setValue(`openingDays.${idx}.enabled`, checked);
                    }}
                  />
                </FormControl>
                <FormLabel className="w-28 mb-0">{dayInfo.label}</FormLabel>
              </div>
              
              <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4 w-full`}>
                <div className={`flex ${isMobile ? "flex-row items-center" : "items-center"} gap-2 ${isMobile ? "mb-2" : ""}`}>
                  <FormLabel className="text-xs text-gray-500 whitespace-nowrap">Inizio</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={currentDay.start}
                      onChange={e => setValue(`openingDays.${idx}.start`, e.target.value)}
                      disabled={!currentDay.enabled}
                      className="w-24"
                    />
                  </FormControl>
                </div>
                
                <div className={`flex ${isMobile ? "flex-row items-center" : "items-center"} gap-2`}>
                  <FormLabel className="text-xs text-gray-500 whitespace-nowrap">Fine</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={currentDay.end}
                      onChange={e => setValue(`openingDays.${idx}.end`, e.target.value)}
                      disabled={!currentDay.enabled}
                      className="w-24"
                    />
                  </FormControl>
                </div>
              </div>
            </FormItem>
          );
        })}
      </div>
    </div>
  );
}


import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { SettingsFormData } from "@/schemas/settingsSchema";

interface CapacitySectionProps {
  control: Control<SettingsFormData>;
}

export function CapacitySection({ control }: CapacitySectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium">Capacità</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Imposta il numero massimo di posti disponibili nel ristorante.
      </p>
      <FormField
        control={control}
        name="availableSeats"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posti disponibili</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="200" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Numero massimo di clienti che possono essere accettati.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

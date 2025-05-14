
import { z } from "zod";

// Definisci i giorni della settimana a partire da lunedì (1) e terminando con domenica (0)
export const daysOfWeek = [
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
  { value: 0, label: "Domenica" },
];

// Schema per l'orario di apertura
export const openingDayScheduleSchema = z.object({
  day: z.number().min(0).max(6),
  enabled: z.boolean(),
  start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Formato orario non valido (HH:MM)",
  }),
  end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Formato orario non valido (HH:MM)",
  }),
});

// Schema per l'intero modulo di impostazioni
export const settingsSchema = z.object({
  openingDays: z.array(openingDayScheduleSchema).length(7), // Una voce per ogni giorno della settimana
  availableSeats: z.number().int().min(1).max(200),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

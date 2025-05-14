
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, isAfter } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OpeningDaySchedule } from "@/types";

interface DateTimePickerProps {
  date: Date | undefined;
  time: string;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  timeOptions: string[];
  openingDays: OpeningDaySchedule[];
}

export function DateTimePicker({ date, time, setDate, setTime, timeOptions, openingDays }: DateTimePickerProps) {
  // Funzione per determinare se una data deve essere disabilitata nel calendario
  const disabledDays = (date: Date) => {
    const dayOfWeek = date.getDay();
    const daySchedule = openingDays.find(day => day.day === dayOfWeek);
    return !daySchedule || !daySchedule.enabled;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-start rounded-md border border-input bg-background px-3 h-10 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !date && "text-muted-foreground",
                disabledDays(date || new Date()) && "border-red-300 text-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: it }) : <span>Seleziona data</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={disabledDays}
              initialFocus
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">Orario</Label>
        <Select 
          value={time} 
          onValueChange={setTime}
          disabled={timeOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona orario" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {timeOptions.length === 0 && date && (
          <p className="text-xs text-red-500">
            Nessun orario disponibile per questa data
          </p>
        )}
      </div>
    </div>
  );
}

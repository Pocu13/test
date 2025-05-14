
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { it } from "date-fns/locale";
import { useRestaurantSettings } from "@/contexts/SettingsContext";
import { addDays } from "date-fns";

interface StepDateTimeProps {
  onSubmit: (date: Date, time: string) => void;
  onBack: () => void;
  initialDate?: Date;
  initialTime?: string;
}

export function StepDateTime({ onSubmit, onBack, initialDate, initialTime }: StepDateTimeProps) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState<string>(initialTime || "");
  const { settings, isLoaded } = useRestaurantSettings();

  // Extract enabled days from settings
  const enabledDays = useMemo(
    () => isLoaded
      ? settings.openingDays.filter(d => d.enabled).map(d => d.day)
      : [],
    [settings, isLoaded]
  );

  // Find schedule for a specific day
  const getScheduleForDay = (d: Date | undefined) => {
    if (!d || !isLoaded) return null;
    const wd = d.getDay(); // 0 = Sunday, 1 = Monday, ...
    return settings.openingDays.find(od => od.day === wd);
  };

  // Generate available time slots for the selected day
  const availableTimeSlots = useMemo(() => {
    if (!date || !isLoaded) return [];
    const schedule = getScheduleForDay(date);
    if (!schedule || !schedule.enabled) return [];

    const { start, end } = schedule;
    const times: string[] = [];
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    // Generate time slots in 30-minute increments
    for (let hour = startHour; hour <= endHour; hour++) {
      let minStart = hour === startHour ? startMinute : 0;
      let minEnd = hour === endHour ? endMinute : 59;

      for (let min = minStart; min <= minEnd; min += 30) {
        if (min > 59) continue; // Skip invalid minutes
        
        if (
          (hour > startHour || min >= startMinute) &&
          (hour < endHour || min <= endMinute)
        ) {
          // Format time as HH:MM
          const timeString = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
          times.push(timeString);
        }
      }
    }

    return times;
  }, [date, settings, isLoaded]);

  // Check if a day should be disabled in the calendar
  const isDayDisabled = (d: Date) => !enabledDays.includes(d.getDay());

  // Find first available date for initial selection
  const findFirstAvailableDate = () => {
    const today = new Date();
    let checkDate = today;
    
    // Check up to 30 days in the future
    for (let i = 0; i < 30; i++) {
      if (!isDayDisabled(checkDate)) {
        return checkDate;
      }
      checkDate = addDays(checkDate, 1);
    }
    return today; // Fallback if no enabled days
  };

  // Set initial date when component loads
  useEffect(() => {
    if (isLoaded && !date && enabledDays.length > 0) {
      setDate(findFirstAvailableDate());
    }
  }, [isLoaded, enabledDays]);

  const handleSubmit = () => {
    if (date && time) {
      onSubmit(date, time);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <CalendarIcon className="w-12 h-12 mx-auto mb-6 text-restaurant-500" />
        <h3 className="text-2xl font-semibold mb-2">Seleziona data e ora</h3>
        <p className="text-muted-foreground">Scegli solo tra i giorni/orari disponibili</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium mb-3">Data</h4>
          <div className="border rounded-lg p-4 bg-white">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={it}
              weekStartsOn={1} // Week starts on Monday
              disabled={isDayDisabled}
              className="mx-auto"
              classNames={{
                day_selected: "bg-restaurant-500 text-white hover:bg-restaurant-600",
                day_today: "bg-muted text-restaurant-500 font-bold"
              }}
            />
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3">Ora</h4>
          {date ? (
            <div className="border rounded-lg p-4 bg-white">
              {availableTimeSlots.length > 0 ? (
                <RadioGroup 
                  value={time} 
                  onValueChange={setTime}
                  className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                >
                  {availableTimeSlots.map((t) => (
                    <div key={t} className="relative">
                      <RadioGroupItem value={t} id={t} className="peer sr-only" />
                      <Label
                        htmlFor={t}
                        className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border text-sm transition-colors peer-data-[state=checked]:border-restaurant-500 peer-data-[state=checked]:bg-restaurant-50 peer-data-[state=checked]:text-restaurant-600"
                      >
                        {t}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Nessun orario disponibile per questa data
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              Seleziona prima una data
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8 space-x-4">
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="w-full"
        >
          Indietro
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!date || !time}
          className="w-full bg-restaurant-500 hover:bg-restaurant-600 text-white"
        >
          Avanti
        </Button>
      </div>
    </div>
  );
}

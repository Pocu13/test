
import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/contexts/ReservationContext";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  const [month, setMonth] = useState<Date>(new Date());
  const { reservations } = useReservations();
  
  const nextMonth = () => {
    setMonth(addMonths(month, 1));
  };
  
  const prevMonth = () => {
    setMonth(subMonths(month, 1));
  };
  
  const getReservationsForDay = (day: Date) => {
    return reservations.filter(res => 
      res.date.getDate() === day.getDate() && 
      res.date.getMonth() === day.getMonth() && 
      res.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendario Prenotazioni</h1>
      
      <Card>
        <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-restaurant-500" />
            <CardTitle>{format(month, "MMMM yyyy", { locale: it })}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-7 lg:grid-cols-7">
            <div className="col-span-full md:col-span-3 lg:col-span-5">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                className="p-3 pointer-events-auto"
                locale={it}
                weekStartsOn={1}
                showOutsideDays
                classNames={{
                  day_selected: "bg-green-500 text-primary-foreground hover:bg-green-600",
                  day_today: "bg-restaurant-100 text-restaurant-800 font-bold",
                  day: "hover:bg-restaurant-50 relative"
                }}
                modifiers={{
                  booked: reservations.map(res => new Date(res.date))
                }}
                modifiersClassNames={{
                  booked: "relative after:absolute after:bottom-1 after:left-1/2 after:w-1 after:h-1 after:bg-green-500 after:rounded-full"
                }}
              />
              
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="text-center text-xs text-muted-foreground">
                    {format(new Date(2023, 0, i + 2), 'EEE', { locale: it })}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-full md:col-span-4 lg:col-span-2">
              <div className="bg-white border rounded-lg p-4 h-full">
                <h3 className="font-medium mb-4">Legenda</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Prenotazione confermata</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Prenotazione in attesa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Prenotazione rifiutata</span>
                  </div>
                </div>
                <div className="border-t my-4"></div>
                <h3 className="font-medium mb-2">Statistiche</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Totale prenotazioni:</span>
                    <span className="font-medium w-8 text-right">{reservations.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>In attesa:</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 w-8 flex justify-center">
                      {reservations.filter(r => r.status === "pending").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confermate:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 w-8 flex justify-center">
                      {reservations.filter(r => r.status === "confirmed").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rifiutate:</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 w-8 flex justify-center">
                      {reservations.filter(r => r.status === "rejected").length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

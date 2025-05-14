
import { useReservations } from "@/contexts/ReservationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfWeek, endOfWeek, isSameMonth, isSameWeek, isSameDay, differenceInDays, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Calendar, Clock } from "lucide-react";

export function StatsDisplay() {
  const { reservations } = useReservations();
  
  // Dati per le statistiche
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === "confirmed").length;
  const pendingReservations = reservations.filter(r => r.status === "pending").length;
  const rejectedReservations = reservations.filter(r => r.status === "rejected").length;
  
  // Calcola il totale di persone prenotate
  const totalPeople = reservations
    .filter(r => r.status === "confirmed" || r.status === "pending")
    .reduce((acc, curr) => acc + curr.people, 0);
  
  // Calcola le prenotazioni per orario
  const reservationsByTime = reservations
    .filter(r => r.status === "confirmed" || r.status === "pending")
    .reduce((acc, curr) => {
      const time = curr.time;
      if (!acc[time]) {
        acc[time] = 0;
      }
      acc[time] += 1;
      return acc;
    }, {} as Record<string, number>);
  
  const timeData = Object.keys(reservationsByTime)
    .sort()
    .map(time => ({
      time,
      prenotazioni: reservationsByTime[time]
    }));
  
  // Calcola le prenotazioni per giorno della settimana
  const now = new Date();
  const startWeek = startOfWeek(now, { weekStartsOn: 1 });  // Inizia da lunedì
  const endWeek = endOfWeek(now, { weekStartsOn: 1 });
  
  const weekdays = Array(7).fill(0).map((_, i) => {
    const date = addDays(startWeek, i);
    return {
      day: format(date, "EEEE", { locale: it }),
      prenotazioni: reservations.filter(r => 
        (r.status === "confirmed" || r.status === "pending") && 
        isSameDay(r.date, date)
      ).length,
      date: format(date, "dd/MM", { locale: it }),
    };
  });
  
  // Dati per il grafico a torta dello stato
  const statusData = [
    { name: "Confermate", value: confirmedReservations, color: "#22c55e" },
    { name: "In attesa", value: pendingReservations, color: "#eab308" },
    { name: "Rifiutate", value: rejectedReservations, color: "#ef4444" },
  ].filter(item => item.value > 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Prenotazioni totali</CardTitle>
            <CardDescription>Totale prenotazioni ricevute</CardDescription>
          </div>
          <Users className="h-5 w-5 text-restaurant-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReservations}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Confermate: {confirmedReservations} | In attesa: {pendingReservations}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Coperti totali</CardTitle>
            <CardDescription>Totale persone prenotate</CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-restaurant-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPeople}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Media per prenotazione: {totalReservations ? Math.round((totalPeople / totalReservations) * 10) / 10 : 0}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Stato prenotazioni</CardTitle>
            <CardDescription>Distribuzione per status</CardDescription>
          </div>
          <Clock className="h-5 w-5 text-restaurant-500" />
        </CardHeader>
        <CardContent>
          {totalReservations ? (
            <div className="h-[70px] mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={35}
                    innerRadius={20}
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm h-[70px] flex items-center justify-center">
              Nessun dato disponibile
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Prenotazioni settimanali</CardTitle>
          <CardDescription>
            {format(startWeek, "d MMM", { locale: it })} - {format(endWeek, "d MMM yyyy", { locale: it })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdays}>
                <XAxis 
                  dataKey="day" 
                  tickFormatter={(v) => v.substring(0, 3)} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => {
                    return [`${value} prenotazioni`, props.payload.day]
                  }}
                  labelFormatter={() => ""}
                />
                <Bar 
                  dataKey="prenotazioni" 
                  fill="#f97316"
                  name="Prenotazioni" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Orari più richiesti</CardTitle>
          <CardDescription>Distribuzione prenotazioni per orario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {timeData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="time" 
                    type="category"
                    width={45}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} prenotazioni`]}
                    labelFormatter={(label) => `Orario: ${label}`}
                  />
                  <Bar 
                    dataKey="prenotazioni" 
                    fill="#f97316"
                    name="Prenotazioni" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nessun dato disponibile
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

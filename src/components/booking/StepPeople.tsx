
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useRestaurantSettings } from "@/contexts/SettingsContext";
import { Badge } from "@/components/ui/badge";
import { tableDefinitions } from "@/data/tableDefinitions";
import { useReservations } from "@/contexts/ReservationContext";
import { findAvailableTableForReservation } from "@/utils/reservationUtils";

interface StepPeopleProps {
  onSubmit: (people: number) => void;
  initialValue?: number;
}

export function StepPeople({ onSubmit, initialValue }: StepPeopleProps) {
  const { settings } = useRestaurantSettings();
  const { reservations } = useReservations();
  const [people, setPeople] = useState(initialValue || 2);
  const [availableCapacities, setAvailableCapacities] = useState<number[]>([]);
  const [isTableAvailable, setIsTableAvailable] = useState(true);
  
  // Controlla la disponibilità dei tavoli ogni volta che cambia il numero di persone
  useEffect(() => {
    console.log("Verifica disponibilità per", people, "persone");
    const availableTable = findAvailableTableForReservation(people, tableDefinitions, reservations);
    console.log("Tavolo disponibile:", availableTable);
    setIsTableAvailable(availableTable !== null);
  }, [people, reservations]);
  
  // Carica le capacità disponibili all'avvio
  useEffect(() => {
    // Trova valori di capacità unici dai tavoli (esclusi strutture e pareti)
    const capacities = [...new Set(
      tableDefinitions
        .filter(table => !table.isStructure && !table.isWall)
        .map(table => table.capacity)
    )].sort((a, b) => a - b);
    
    console.log("Capacità disponibili:", capacities);
    setAvailableCapacities(capacities);
    
    // Imposta un valore iniziale valido
    if (initialValue) {
      if (!capacities.includes(initialValue)) {
        setPeople(capacities[0] || 2);
      }
    } else {
      setPeople(capacities[0] || 2);
    }
  }, [initialValue]);

  const handleDecrease = () => {
    const currentIndex = availableCapacities.indexOf(people);
    if (currentIndex > 0) {
      setPeople(availableCapacities[currentIndex - 1]);
    }
  };

  const handleIncrease = () => {
    const currentIndex = availableCapacities.indexOf(people);
    if (currentIndex < availableCapacities.length - 1) {
      setPeople(availableCapacities[currentIndex + 1]);
    }
  };

  return (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <Users className="w-12 h-12 mx-auto mb-6 text-restaurant-500" />
        <h3 className="text-2xl font-semibold mb-2">Quante persone verranno?</h3>
        <p className="text-muted-foreground">Seleziona il numero di ospiti per la tua prenotazione</p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handleDecrease}
          disabled={availableCapacities.indexOf(people) <= 0}
          className="h-12 w-12 rounded-full border-2"
        >
          -
        </Button>
        
        <div className="w-20 text-4xl font-bold">{people}</div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleIncrease}
          disabled={availableCapacities.indexOf(people) >= availableCapacities.length - 1}
          className="h-12 w-12 rounded-full border-2"
        >
          +
        </Button>
      </div>

      <div className="mb-8">
        {!isTableAvailable && (
          <Badge variant="destructive" className="mb-2">
            Non ci sono tavoli disponibili per {people} persone
          </Badge>
        )}
        <p className="text-sm text-muted-foreground">
          Per gruppi superiori a {Math.max(...availableCapacities, 9)} persone, chiamaci direttamente.
        </p>
      </div>

      <Button
        onClick={() => onSubmit(people)}
        size="lg"
        className="w-full bg-restaurant-500 hover:bg-restaurant-600 text-white py-6"
        disabled={!isTableAvailable}
      >
        Avanti
      </Button>
    </div>
  );
}

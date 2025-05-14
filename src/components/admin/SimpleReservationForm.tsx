
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TableDefinition } from "@/types/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SimpleReservationFormProps {
  selectedTable?: TableDefinition | null;
  onSubmit: (formData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    people: number;
    notes: string;
  }) => void;
  isSubmitting: boolean;
  alwaysVisible?: boolean;
}

export function SimpleReservationForm({ 
  selectedTable,
  onSubmit, 
  isSubmitting,
  alwaysVisible = true
}: SimpleReservationFormProps) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(selectedTable?.capacity || 2);
  const [notes, setNotes] = useState("");
  
  // Aggiorna il numero di persone quando viene selezionato un tavolo
  useEffect(() => {
    if (selectedTable) {
      setPeople(selectedTable.capacity);
    }
  }, [selectedTable]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      surname,
      email,
      phone,
      people,
      notes
    });
    
    // Reset form
    setName("");
    setSurname("");
    setEmail("");
    setPhone("");
    setNotes("");
  };

  if (!alwaysVisible && !selectedTable) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md text-gray-400">
        Seleziona un tavolo dalla piantina per creare una nuova prenotazione
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome cliente"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="surname">Cognome</Label>
        <Input
          id="surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          placeholder="Cognome cliente"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@esempio.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numero di telefono"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="people">Numero di persone</Label>
        <Select 
          value={people.toString()} 
          onValueChange={value => setPeople(parseInt(value))}
          disabled={!!selectedTable}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona il numero di persone" />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6, 7, 9].map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} persone
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTable ? (
          <p className="text-xs text-muted-foreground">
            Il tavolo selezionato ha una capacità di {selectedTable.capacity} persone
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Verrà cercato un tavolo libero con questa capacità
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Eventuali note sulla prenotazione"
          className="resize-none"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-restaurant-500 hover:bg-restaurant-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvataggio..." : "Crea prenotazione"}
      </Button>
    </form>
  );
}

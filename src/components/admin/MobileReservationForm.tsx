
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";

interface MobileReservationFormProps {
  onSubmit: (formData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    people: number;
    notes: string;
  }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function MobileReservationForm({ 
  onSubmit, 
  isSubmitting,
  onCancel
}: MobileReservationFormProps) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(2);
  const [notes, setNotes] = useState("");
  
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
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Nuova Prenotazione</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            onValueChange={(value) => setPeople(parseInt(value))}
          >
            <SelectTrigger id="people">
              <SelectValue placeholder="Seleziona il numero di persone" />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 7].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} persone
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Il tavolo verrà assegnato automaticamente in base al numero di persone
          </p>
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
        
        <DialogFooter className="pt-4">
          <Button 
            variant="outline" 
            type="button"
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            className="bg-restaurant-500 hover:bg-restaurant-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvataggio..." : "Crea prenotazione"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

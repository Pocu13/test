
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PeopleAndNotesProps {
  people: number;
  notes: string;
  setPeople: (value: number) => void;
  setNotes: (value: string) => void;
}

export function PeopleAndNotes({ people, notes, setPeople, setNotes }: PeopleAndNotesProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="people">Numero persone</Label>
        <Select 
          value={people.toString()} 
          onValueChange={(value) => setPeople(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona numero persone" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({length: 20}, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? "persona" : "persone"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Note (opzionale)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note aggiuntive per la prenotazione"
          className="resize-none"
          rows={3}
        />
      </div>
    </>
  );
}

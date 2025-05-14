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
    time: string; // aggiunto
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
  const [time, setTime] = useState(""); // nuovo stato per l'orario

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
      notes,
      time, // incluso nell'invio
    });
    
    // Reset form
    setName("");
    setSurname("");
    setEmail("");
    setPhone("");
    setNotes("");
    setTime(""); // reset orario
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

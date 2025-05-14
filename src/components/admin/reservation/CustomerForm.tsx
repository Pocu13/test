
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  name: string;
  surname: string;
  email: string;
  phone: string;
  setName: (value: string) => void;
  setSurname: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
}

export function CustomerForm({ 
  name, surname, email, phone, 
  setName, setSurname, setEmail, setPhone 
}: CustomerFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </>
  );
}

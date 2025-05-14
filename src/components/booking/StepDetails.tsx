
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Il nome deve contenere almeno 2 caratteri" })
    .max(50, { message: "Il nome non può superare i 50 caratteri" }),
  surname: z.string()
    .min(2, { message: "Il cognome deve contenere almeno 2 caratteri" })
    .max(50, { message: "Il cognome non può superare i 50 caratteri" }),
  email: z.string()
    .email({ message: "Inserisci un indirizzo email valido" }),
  phone: z.string()
    .min(8, { message: "Il numero di telefono deve contenere almeno 8 caratteri" })
    .max(20, { message: "Il numero di telefono non può superare i 20 caratteri" }),
  notes: z.string()
    .max(500, { message: "Le note non possono superare i 500 caratteri" })
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StepDetailsProps {
  onSubmit: (data: FormData) => void;
  onBack: () => void;
  initialValues?: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    notes: string;
  };
}

export function StepDetails({ onSubmit, onBack, initialValues }: StepDetailsProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      surname: "",
      email: "",
      phone: "",
      notes: ""
    }
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack} 
        className="mb-4 flex items-center text-restaurant-600 hover:text-restaurant-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        <span>Indietro</span>
      </button>

      <h3 className="text-xl font-medium text-gray-800 mb-6 text-center">
        I tuoi dati
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il tuo nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognome*</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il tuo cognome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="La tua email per conferme" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono*</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Numero di telefono" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note (opzionale)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Eventuali richieste particolari" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Comunica eventuali allergie, preferenze o richieste speciali.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-restaurant-500 hover:bg-restaurant-600 text-white"
          >
            Continua
          </Button>
        </form>
      </Form>
    </div>
  );
}

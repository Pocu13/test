
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ValidationErrorProps {
  error: string | null;
}

export function ValidationError({ error }: ValidationErrorProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Errore</AlertTitle>
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  );
}

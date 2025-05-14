
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Reservation } from "@/types";

interface ReservationDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  reservation: Reservation;
}

export function ReservationDeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  reservation
}: ReservationDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 border-gray-300"
          onClick={() => onOpenChange(true)}
        >
          <Trash className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conferma eliminazione</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare la prenotazione di {reservation.name} {reservation.surname} del {format(reservation.date, "dd/MM/yyyy", { locale: it })}? Questa azione non può essere annullata.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
          >
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

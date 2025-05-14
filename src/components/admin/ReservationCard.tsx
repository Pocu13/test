
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Trash, MoreHorizontal } from "lucide-react";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { Reservation, ReservationStatus } from "@/types";
import { ReservationDeleteDialog } from "./ReservationDeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReservationCardProps {
  reservation: Reservation;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  onDeleteConfirmChange: (id: string | null) => void;
  tableNumber?: string | number;
  hideDeletion?: boolean;
}

export function ReservationCard({
  reservation,
  onUpdateStatus,
  onDelete,
  deleteConfirmId,
  onDeleteConfirmChange,
  tableNumber = "-",
  hideDeletion = false
}: ReservationCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{reservation.name} {reservation.surname}</h3>
              <p className="text-sm text-muted-foreground">{reservation.email}</p>
              <p className="text-sm font-semibold mt-1">Tavolo: {tableNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <ReservationStatusBadge status={reservation.status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdateStatus(reservation.id, "confirmed")}>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Conferma</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(reservation.id, "pending")}>
                    <Check className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>In attesa</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(reservation.id, "rejected")}>
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    <span>Rifiuta</span>
                  </DropdownMenuItem>
                  {!hideDeletion && (
                    <DropdownMenuItem onClick={() => onDeleteConfirmChange(reservation.id)}>
                      <Trash className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Elimina</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-medium">Data</div>
              <div>{format(reservation.date, "dd/MM/yyyy", { locale: it })}</div>
            </div>
            <div>
              <div className="font-medium">Orario</div>
              <div>{reservation.time}</div>
            </div>
            <div>
              <div className="font-medium">Persone</div>
              <div>{reservation.people}</div>
            </div>
            <div>
              <div className="font-medium">Telefono</div>
              <div>{reservation.phone}</div>
            </div>
          </div>

          {reservation.notes && (
            <div className="text-sm">
              <div className="font-medium">Note</div>
              <div className="text-muted-foreground">{reservation.notes}</div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            {reservation.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-green-500 text-green-500 hover:bg-green-50"
                  onClick={() => onUpdateStatus(reservation.id, "confirmed")}
                >
                  <Check className="h-4 w-4 mr-1" /> Accetta
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => onUpdateStatus(reservation.id, "rejected")}
                >
                  <X className="h-4 w-4 mr-1" /> Rifiuta
                </Button>
              </>
            )}
            <ReservationDeleteDialog
              isOpen={deleteConfirmId === reservation.id}
              onOpenChange={(open) => !open && onDeleteConfirmChange(null)}
              onConfirm={() => onDelete(reservation.id)}
              onCancel={() => onDeleteConfirmChange(null)}
              reservation={reservation}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

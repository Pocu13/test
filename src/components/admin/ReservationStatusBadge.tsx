
import { Badge } from "@/components/ui/badge";
import { ReservationStatus } from "@/types";

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-500">In attesa</Badge>;
    case "confirmed":
      return <Badge className="bg-green-500">Confermata</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">Rifiutata</Badge>;
  }
}

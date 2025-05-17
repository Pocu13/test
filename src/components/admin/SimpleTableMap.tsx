import { TableDefinition } from "@/types/table";
import { Reservation } from "@/types";
import clsx from "clsx";

interface SimpleTableMapProps {
  reservations: Reservation[];
  onTableSelect: (table: TableDefinition) => void;
  selectedTableId: string | null;
  highlightReservation: string | null;
  zoom: number;
}

export function SimpleTableMap({
  reservations,
  onTableSelect,
  selectedTableId,
  highlightReservation,
  zoom,
}: SimpleTableMapProps) {
  const tables: TableDefinition[] = [
    { id: "1", number: 1, x: 10, y: 10, seats: 4 },
    { id: "2", number: 2, x: 150, y: 10, seats: 4 },
    { id: "3", number: 3, x: 10, y: 100, seats: 6 },
    { id: "4", number: 4, x: 150, y: 100, seats: 2 },
    // aggiungi altri tavoli se necessario
  ];

  const isTableReserved = (tableId: string) => {
    return reservations.some(res => 
      res.tableId === tableId && 
      (res.status === "pending" || res.status === "confirmed")
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 rounded-md">
      <div
        className="absolute left-0 top-0 transition-transform origin-top-left"
        style={{ transform: `scale(${zoom})` }}
      >
        {tables.map((table) => {
          const reserved = isTableReserved(table.id);
          const isSelected = selectedTableId === table.id;
          const isHighlighted = highlightReservation 
            && reservations.find(r => r.id === highlightReservation)?.tableId === table.id;

          return (
            <div
              key={table.id}
              onClick={() => onTableSelect(table)}
              className={clsx(
                "absolute border rounded-md w-24 h-16 flex items-center justify-center cursor-pointer text-sm font-medium",
                reserved ? "bg-red-400 text-white" : "bg-green-200 hover:bg-green-300",
                isSelected && "ring-2 ring-blue-500",
                isHighlighted && "animate-pulse"
              )}
              style={{
                left: table.x,
                top: table.y,
              }}
            >
              Tav. {table.number}
            </div>
          );
        })}
      </div>
    </div>
  );
}

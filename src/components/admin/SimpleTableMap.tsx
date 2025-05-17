import { TableDefinition, Reservation } from "@/types";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface SimpleTableMapProps {
  reservations: Reservation[];
  onTableSelect?: (table: TableDefinition) => void;
  selectedTableId?: string | null;
  highlightReservation?: string | null;
}

export function SimpleTableMap({
  reservations,
  onTableSelect,
  selectedTableId,
  highlightReservation,
}: SimpleTableMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2)); // zoom max 2x
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5)); // zoom min 0.5x
  };

  // Simula tavoli per l’esempio
  const tables: TableDefinition[] = [
    { id: "1", number: 1, x: 50, y: 50 },
    { id: "2", number: 2, x: 200, y: 50 },
    { id: "3", number: 3, x: 50, y: 200 },
    { id: "4", number: 4, x: 200, y: 200 },
    // Aggiungi altri tavoli se servono
  ];

  const isTableOccupied = (tableId: string) => {
    return reservations.some(
      (r) => r.tableId === tableId && (r.status === "pending" || r.status === "confirmed")
    );
  };

  return (
    <div className="relative border rounded-md overflow-hidden" style={{ height: "400px" }}>
      {/* Pulsanti zoom */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded bg-white border shadow hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded bg-white border shadow hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full transition-transform duration-300 origin-top-left"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {tables.map((table) => {
          const occupied = isTableOccupied(table.id);
          const selected = selectedTableId === table.id;
          const highlighted = reservations.find(
            (r) => r.id === highlightReservation && r.tableId === table.id
          );

          return (
            <div
              key={table.id}
              onClick={() => onTableSelect?.(table)}
              className={cn(
                "absolute w-16 h-16 border flex items-center justify-center text-sm font-semibold cursor-pointer transition-colors duration-200",
                occupied ? "bg-red-200 border-red-500" : "bg-green-200 border-green-500",
                selected && "ring-2 ring-blue-500",
                highlighted && "animate-pulse"
              )}
              style={{
                top: table.y,
                left: table.x,
              }}
            >
              {table.number}
            </div>
          );
        })}
      </div>
    </div>
  );
}

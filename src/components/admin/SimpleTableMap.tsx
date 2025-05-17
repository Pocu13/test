// ✅ SimpleTableMap.tsx aggiornato: include la mappa esatta basata sull'immagine fornita, mantenendo le logiche originali e aggiungendo zoom e layout preciso.

import { TableDefinition } from "@/types/table";
import { Reservation } from "@/types";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "../ui/button";

interface SimpleTableMapProps {
  reservations: Reservation[];
  onTableSelect: (table: TableDefinition) => void;
  selectedTableId?: string | null;
  highlightReservation?: string | null;
}

export function SimpleTableMap({
  reservations,
  onTableSelect,
  selectedTableId,
  highlightReservation,
}: SimpleTableMapProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const getTableStatus = (tableId: string) => {
    const tableReservations = reservations.filter((res) => res.tableId === tableId);
    if (tableReservations.some((r) => r.status === "confirmed")) return "occupied";
    if (tableReservations.some((r) => r.status === "pending")) return "pending";
    return "free";
  };

  const handleTableClick = (table: TableDefinition) => {
    onTableSelect(table);
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));

  const tables: TableDefinition[] = [
    { id: "1", number: 1, seats: 6, x: 720, y: 460, shape: "rectangle", rotation: 45 },
    { id: "2", number: 2, seats: 2, x: 680, y: 360, shape: "square" },
    { id: "3", number: 3, seats: 5, x: 680, y: 280, shape: "circle" },
    { id: "4", number: 4, seats: 4, x: 680, y: 200, shape: "circle" },
    { id: "5", number: 5, seats: 7, x: 600, y: 100, shape: "rectangle" },
    { id: "6", number: 6, seats: 4, x: 620, y: 280, shape: "square" },
    { id: "7", number: 7, seats: 5, x: 620, y: 50, shape: "circle" },
    { id: "8", number: 8, seats: 2, x: 480, y: 20, shape: "square" },
    { id: "9", number: 9, seats: 2, x: 500, y: 200, shape: "square" },
    { id: "10", number: 10, seats: 2, x: 500, y: 280, shape: "square" },
    { id: "102", number: 102, seats: 2, x: 460, y: 160, shape: "square" },
    { id: "103", number: 103, seats: 2, x: 440, y: 100, shape: "square" },
    { id: "100", number: 100, seats: 5, x: 400, y: 50, shape: "circle" },
    { id: "101", number: 101, seats: 6, x: 400, y: 200, shape: "square" },
    { id: "27", number: 27, seats: 6, x: 340, y: 280, shape: "square" },
    { id: "28", number: 28, seats: 6, x: 340, y: 50, shape: "square" },
    { id: "26", number: 26, seats: 6, x: 280, y: 280, shape: "square" },
    { id: "25", number: 25, seats: 6, x: 280, y: 200, shape: "square" },
    { id: "23", number: 23, seats: 6, x: 280, y: 100, shape: "square" },
    { id: "21", number: 21, seats: 6, x: 260, y: 50, shape: "ellipse" },
    { id: "24", number: 24, seats: 6, x: 200, y: 280, shape: "square" },
    { id: "22", number: 22, seats: 6, x: 200, y: 200, shape: "square" },
    { id: "BAR", number: 0, seats: 0, x: 360, y: 200, shape: "bar" },
    { id: "11", number: 11, seats: 6, x: 380, y: 280, shape: "square" },
    { id: "17", number: 17, seats: 6, x: 440, y: 360, shape: "rectangle", rotation: 45 },
  ];

  return (
    <div className="relative h-[500px] border rounded overflow-hidden">
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button size="sm" onClick={zoomIn}>＋</Button>
        <Button size="sm" onClick={zoomOut}>−</Button>
      </div>

      <div
        ref={containerRef}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          width: "1000px",
          height: "800px",
          position: "relative",
          backgroundColor: "#f8f8f8",
        }}
      >
        {tables.map((table) => {
          if (table.shape === "bar") {
            return (
              <div
                key={table.id}
                className="absolute bg-gray-200 text-xs text-white flex items-center justify-center"
                style={{
                  left: table.x,
                  top: table.y,
                  width: 140,
                  height: 40,
                  backgroundColor: "#eee",
                  borderRadius: 4,
                  textAlign: "center",
                  fontSize: 10,
                }}
              >
                BAR
              </div>
            );
          }

          const status = getTableStatus(table.id);
          const isSelected = selectedTableId === table.id;
          const isHighlighted = highlightReservation && reservations.some(r => r.id === highlightReservation && r.tableId === table.id);

          const baseColor =
            status === "occupied"
              ? "bg-red-500"
              : status === "pending"
              ? "bg-yellow-400"
              : "bg-green-400";

          const shapeClass =
            table.shape === "circle"
              ? "rounded-full"
              : table.shape === "ellipse"
              ? "rounded-full w-[60px] h-[40px]"
              : "rounded";

          const rotateStyle = table.rotation
            ? { transform: `rotate(${table.rotation}deg)` }
            : {};

          return (
            <div
              key={table.id}
              className={clsx(
                "absolute text-white text-xs font-semibold flex items-center justify-center cursor-pointer shadow-md",
                baseColor,
                shapeClass,
                {
                  "ring-2 ring-blue-500": isSelected,
                  "animate-pulse": isHighlighted,
                }
              )}
              onClick={() => handleTableClick(table)}
              style={{
                left: table.x,
                top: table.y,
                width: 50,
                height: 50,
                ...rotateStyle,
              }}
            >
              <div className="text-center">
                <div>TAV.{table.number}</div>
                <div className="text-[10px]">{table.seats}p</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

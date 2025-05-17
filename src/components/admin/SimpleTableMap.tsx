import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const initialScale = 1;

const tableData = [
  { id: 1, label: "TAV.1", seats: 6, top: "85%", left: "85%", rotate: "-30deg", shape: "rect" },
  { id: 2, label: "TAV.2", seats: 2, top: "75%", left: "80%", shape: "square" },
  { id: 3, label: "TAV.3", seats: 5, top: "65%", left: "80%", shape: "circle" },
  { id: 4, label: "TAV.4", seats: 4, top: "55%", left: "80%", shape: "circle" },
  { id: 6, label: "TAV.6", seats: 7, top: "40%", left: "75%", shape: "rect" },
  { id: 7, label: "TAV.7", seats: 5, top: "25%", left: "78%", shape: "circle" },
  { id: 8, label: "TAV.8", seats: 2, top: "10%", left: "60%", shape: "square" },
  { id: 9, label: "TAV.9", seats: 2, top: "45%", left: "60%", shape: "square" },
  { id: 10, label: "TAV.10", seats: 2, top: "55%", left: "60%", shape: "square" },
  { id: 21, label: "TAV.21", seats: 6, top: "85%", left: "25%", shape: "oval" },
  { id: 23, label: "TAV.23", seats: 3, top: "75%", left: "15%", shape: "square" },
  { id: 25, label: "TAV.25", seats: 2, top: "65%", left: "15%", shape: "square" },
  { id: 27, label: "TAV.27", seats: 2, top: "50%", left: "15%", shape: "square" },
  { id: 28, label: "TAV.28", seats: 3, top: "35%", left: "18%", shape: "square" },
  { id: 71, label: "TAV.71", seats: 6, top: "70%", left: "45%", rotate: "30deg", shape: "rect" },
  { id: 100, label: "TAV.100", seats: 5, top: "20%", left: "35%", shape: "circle" },
  { id: 101, label: "TAV.101", seats: 2, top: "40%", left: "25%", shape: "square" },
  { id: 102, label: "TAV.102", seats: 2, top: "40%", left: "50%", shape: "square" },
  { id: 103, label: "TAV.103", seats: 2, top: "30%", left: "45%", shape: "square" }
];

const getColor = (status: string) => {
  switch (status) {
    case "occupied":
      return "bg-red-400";
    case "pending":
      return "bg-yellow-400";
    case "available":
    default:
      return "bg-green-400";
  }
};

export default function SimpleTableMap({ tables = [], onTableSelect }: any) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [scale, setScale] = useState(initialScale);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const handleTableClick = (id: number) => {
    setSelectedTable(id);
    if (onTableSelect) onTableSelect(id);
  };

  return (
    <div className="relative bg-gray-100 rounded-md shadow-md" style={{ height: "500px" }}>
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button onClick={handleZoomIn}>＋</Button>
        <Button onClick={handleZoomOut}>－</Button>
      </div>
      <div
        className="relative w-full h-full overflow-hidden"
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        {tableData.map((table) => {
          const matched = tables.find((t: any) => t.id === table.id);
          const status = matched?.status || "available";
          const color = getColor(status);

          return (
            <div
              key={table.id}
              className={cn(
                "absolute text-white font-bold flex items-center justify-center cursor-pointer shadow-md",
                selectedTable === table.id ? "ring-4 ring-blue-500" : "",
                color,
                table.shape === "circle" && "rounded-full",
                table.shape === "oval" && "rounded-full px-4",
                table.shape === "square" && "w-12 h-12",
                table.shape === "rect" && "w-20 h-12",
              )}
              onClick={() => handleTableClick(table.id)}
              style={{
                top: table.top,
                left: table.left,
                transform: table.rotate ? `rotate(${table.rotate})` : undefined,
                position: "absolute",
                width: table.shape === "circle" ? "48px" : undefined,
                height: table.shape === "circle" ? "48px" : undefined,
              }}
            >
              <div className="text-xs text-center">
                {table.label}
                <br />
                {table.seats}p
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


import { useState, useEffect, useRef } from "react";
import { TableDefinition, TableWithStatus } from "@/types/table";
import { Reservation } from "@/types";
import { cn } from "@/lib/utils";
import { tableDefinitions } from "@/data/tableDefinitions";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableMapProps {
  reservations?: Reservation[];
  onTableSelect?: (table: TableDefinition) => void;
  selectedTable?: string | null;
  scale?: number;
  readOnly?: boolean;
  highlightByPeople?: number | null;
}

export function TableMap({ 
  reservations = [], 
  onTableSelect, 
  selectedTable = null,
  scale = 0.5,
  readOnly = false,
  highlightByPeople = null
}: TableMapProps) {
  const [tables, setTables] = useState<TableWithStatus[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  
  // Determine table status based on reservations
  useEffect(() => {
    const tablesWithStatus = tableDefinitions.map(table => {
      // Default state is "free"
      let status: "free" | "pending" | "occupied" = "free";
      
      // Check for reservations linked to this table
      const tableReservations = reservations.filter(res => {
        // Match reservation's people count with table capacity
        return res.people === table.capacity;
      });
      
      if (tableReservations.length > 0) {
        // Check if any of these reservations are confirmed
        const confirmedReservation = tableReservations.find(r => r.status === "confirmed");
        const pendingReservation = tableReservations.find(r => r.status === "pending");
        
        if (confirmedReservation) {
          status = "occupied";
        } else if (pendingReservation) {
          status = "pending";
        }
      }
      
      // Highlight tables that can accommodate the exact number of people requested
      if (highlightByPeople && table.capacity === highlightByPeople) {
        status = "free"; // Li mostriamo come liberi ma saranno evidenziati dall'UI
      }
      
      return { ...table, status };
    });
    
    setTables(tablesWithStatus);
  }, [reservations, highlightByPeople]);
  
  const getTableColor = (table: TableWithStatus) => {
    if (selectedTable === table.id) {
      return "bg-purple-500 border-purple-700 text-white";
    }
    
    if (highlightByPeople && table.capacity === highlightByPeople) {
      return "bg-blue-100 border-blue-300 text-blue-700 animate-pulse";
    }
    
    switch(table.status) {
      case "free":
        return "bg-green-100 border-green-300 text-green-700 hover:bg-green-200";
      case "pending":
        return "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200";
      case "occupied":
        return "bg-red-100 border-red-300 text-red-700 hover:bg-red-200";
      default:
        return "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200";
    }
  };
  
  const getTableShape = (table: TableWithStatus) => {
    switch(table.shape) {
      case "circle":
        return "rounded-full";
      case "rectangle":
        return "rounded-md";
      case "square":
      default:
        return "rounded-sm";
    }
  };
  
  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };
  
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };
  
  // Clean up event listeners
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);
  
  return (
    <div 
      ref={containerRef} 
      className="relative border border-gray-200 rounded-md overflow-hidden bg-white w-full h-full"
      style={{ height: `${600 * scale}px`, minHeight: "400px" }}
    >
      <div 
        ref={contentRef}
        className="absolute inset-0 overflow-auto"
      >
        <div 
          style={{
            width: 1400 * scale,
            height: 900 * scale,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
        >
          <div 
            className="w-full h-full relative"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* Fixed structures - Walls and Bar */}
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Vertical wall on left */}
              <div className="absolute top-0 left-270 w-20 h-170 bg-gray-800"></div>
              
              {/* Vertical wall in middle-left */}
              <div className="absolute top-230 left-270 w-20 h-140 bg-gray-800"></div>
              
              {/* Vertical wall in middle-right */}
              <div className="absolute top-260 left-750 w-20 h-140 bg-gray-800"></div>
              
              {/* Vertical wall on right */}
              <div className="absolute top-0 left-1130 w-20 h-150 bg-gray-800"></div>
            </div>
            
            {/* Tables */}
            {tables.map((table) => (
              <div
                key={table.id}
                className={cn(
                  "absolute border-2 flex items-center justify-center transition-colors",
                  getTableShape(table),
                  getTableColor(table),
                  table.number === 0 ? "pointer-events-none" : "cursor-pointer",
                  readOnly && "pointer-events-none"
                )}
                style={{
                  top: table.position.y,
                  left: table.position.x,
                  width: table.width,
                  height: table.height,
                  transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined
                }}
                onClick={() => table.number !== 0 && onTableSelect && onTableSelect(table)}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className={cn(
                    "font-bold",
                    table.number === 0 ? "text-xl" : ""
                  )}>
                    {table.number === 0 ? "BAR" : `TAV.${table.number}`}
                  </div>
                  {table.capacity > 0 && (
                    <div className="text-xs font-medium">{table.capacity}p</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

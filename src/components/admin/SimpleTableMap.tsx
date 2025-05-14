import { useState, useEffect } from "react";
import { TableDefinition, TableWithStatus, TableStatus } from "@/types/table";
import { Reservation } from "@/types";
import { getTableStatusMap, getTableNumberStatusMap } from "@/utils/reservationUtils";
import { toast } from "@/components/ui/use-toast";

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
  highlightReservation
}: SimpleTableMapProps) {
  const [tables, setTables] = useState<TableWithStatus[]>([]);
  const [mapDimensions, setMapDimensions] = useState({ width: 1400, height: 800 });
  const [scale, setScale] = useState(1);
  
  // Importazione dinamica dei tableDefinitions
  useEffect(() => {
    // Usiamo un import dinamico per evitare problemi con il bundling
    import("@/data/tableDefinitions").then((module) => {
      const tableDefinitions = module.tableDefinitions;
      initializeTables(tableDefinitions);
    });
  }, []);

  // Aggiorna lo stato delle tabelle ogni volta che cambiano le prenotazioni
  useEffect(() => {
    import("@/data/tableDefinitions").then((module) => {
      const tableDefinitions = module.tableDefinitions;
      updateTablesStatus(tableDefinitions);
    });
  }, [reservations, highlightReservation]);

  // Gestione del ridimensionamento
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.table-map-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const widthScale = containerWidth / mapDimensions.width;
        const heightScale = containerHeight / mapDimensions.height;
        const newScale = Math.min(widthScale, heightScale, 1);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapDimensions]);
  
  const initializeTables = (tableDefinitions: TableDefinition[]) => {
    // Trova le dimensioni massime della mappa
    let maxX = 0;
    let maxY = 0;
    
    tableDefinitions.forEach(table => {
      maxX = Math.max(maxX, table.position.x + table.width);
      maxY = Math.max(maxY, table.position.y + table.height);
    });
    
    setMapDimensions({
      width: maxX + 50, // Aggiungi un po' di margine
      height: maxY + 50
    });
    
    updateTablesStatus(tableDefinitions);
  };
  
  const updateTablesStatus = (tableDefinitions: TableDefinition[]) => {
    // Ottieni la mappa degli stati dei tavoli dalle prenotazioni
    const tableStatusMap = getTableStatusMap(reservations);
    const tableNumberStatusMap = getTableNumberStatusMap(reservations);
    
    // Crea array di tavoli con stato
    const tablesWithStatus = tableDefinitions.map(table => {
      // Stato predefinito: libero (verde)
      let status: TableStatus = "free";
      
      // Controlla se il tavolo è occupato usando sia l'ID che il numero del tavolo
      if (tableStatusMap.has(table.id)) {
        const reservationStatus = tableStatusMap.get(table.id);
        status = reservationStatus === "confirmed" ? "occupied" : "pending";
      } 
      else if (tableNumberStatusMap.has(table.number)) {
        const reservationStatus = tableNumberStatusMap.get(table.number);
        status = reservationStatus === "confirmed" ? "occupied" : "pending";
      }
      
      // Trova la prenotazione che occupa questo tavolo (se esiste)
      const reservation = reservations.find(res => 
        (res.tableId === table.id || res.tableNumber === table.number) && 
        (res.status === "pending" || res.status === "confirmed")
      );
      
      return {
        ...table,
        status,
        reservation: reservation?.id || null
      };
    });
    
    setTables(tablesWithStatus);
  };

  const handleTableClick = (table: TableWithStatus) => {
    // Non permettere la selezione di strutture o tavoli occupati
    if (table.isStructure || table.status !== "free") {
      if (table.status === "occupied") {
        toast({
          title: "Tavolo occupato",
          description: `Il tavolo ${table.number} è già confermato e non può essere selezionato.`,
          variant: "destructive"
        });
      } else if (table.status === "pending") {
        toast({
          title: "Tavolo in attesa di conferma",
          description: `Il tavolo ${table.number} è in attesa di conferma e non può essere selezionato.`,
          variant: "destructive"
        });
      }
      return;
    }
    
    if (onTableSelect) {
      onTableSelect(table);
    }
  };
  
  const getTableColor = (table: TableWithStatus): string => {
    // Non colorare strutture come il bar
    if (table.isStructure) {
      return "bg-gray-200";
    }
    
    // Evidenzia il tavolo selezionato
    if (table.id === selectedTableId) {
      return "bg-blue-500";
    }
    
    // Evidenzia il tavolo associato a una prenotazione selezionata
    if (table.reservation === highlightReservation) {
      return "bg-yellow-300";
    }
    
    // Colora in base allo stato - usiamo colori più adatti come richiesto
    switch (table.status) {
      case "free":
        return "bg-green-500"; // Verde per tavolo libero
      case "pending":
        return "bg-amber-500"; // Arancione per tavolo in attesa di conferma
      case "occupied":
        return "bg-red-500";   // Rosso per tavolo confermato/occupato
      default:
        return "bg-green-500"; // Default verde (libero) se non c'è stato definito
    }
  };
  
  const renderTable = (table: TableWithStatus) => {
    const commonClasses = `absolute shadow-md text-center flex flex-col justify-center items-center transition-colors duration-200 ${getTableColor(table)} text-white`;
    const transform = table.rotation 
      ? `translate(-50%, -50%) rotate(${table.rotation}deg)` 
      : "translate(-50%, -50%)";
    const style = {
      left: `${table.position.x}px`,
      top: `${table.position.y}px`,
      width: `${table.width}px`,
      height: `${table.height}px`,
      transform
    };
    
    // Gestisci lo stato di disabilitazione: tavoli non selezionabili se sono strutture o occupati
    const isDisabled = table.isStructure || table.status !== "free";
    const disabledClass = isDisabled ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:opacity-90";
    
    // Testo con numero e capacità
    const tableText = table.label || `TAV.${table.number}`;
    const capacityText = table.capacity > 0 ? `${table.capacity}p` : '';

    // Renderizza il tavolo in base alla forma
    switch (table.shape) {
      case "circle":
        return (
          <div
            key={table.id}
            style={style}
            className={`${commonClasses} ${disabledClass} rounded-full`}
            onClick={() => handleTableClick(table)}
          >
            <div className="text-sm font-bold">{tableText}</div>
            {capacityText && <div className="text-xs">{capacityText}</div>}
          </div>
        );
      case "square":
        return (
          <div
            key={table.id}
            style={style}
            className={`${commonClasses} ${disabledClass}`}
            onClick={() => handleTableClick(table)}
          >
            <div className="text-sm font-bold">{tableText}</div>
            {capacityText && <div className="text-xs">{capacityText}</div>}
          </div>
        );
      case "rectangle":
        return (
          <div
            key={table.id}
            style={style}
            className={`${commonClasses} ${disabledClass}`}
            onClick={() => handleTableClick(table)}
          >
            <div className="text-sm font-bold">{tableText}</div>
            {capacityText && <div className="text-xs">{capacityText}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="table-map-container relative overflow-auto border rounded-md bg-gray-50" style={{ height: '100%', width: '100%', minHeight: '400px' }}>
      <div 
        className="table-map relative"
        style={{
          width: `${mapDimensions.width}px`,
          height: `${mapDimensions.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      >
        {tables.map(table => renderTable(table))}
      </div>
    </div>
  );
}

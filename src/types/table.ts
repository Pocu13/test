
export interface TableDefinition {
  id: string;
  number: number;
  capacity: number;
  shape: "circle" | "square" | "rectangle";
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  rotation?: number;
  isStructure?: boolean;
  isWall?: boolean;
  label?: string;
}

export type TableStatus = "free" | "pending" | "occupied";

export interface TableWithStatus extends TableDefinition {
  status: TableStatus;
  reservation?: string | null; // ID della prenotazione se il tavolo è occupato
}

export interface TableReservation {
  tableId: string;
  tableNumber: number;
  date: string;
  time: string;
  reservation: string;
}

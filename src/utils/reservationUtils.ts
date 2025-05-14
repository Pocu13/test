
import { Reservation, ReservationStatus } from "@/types";
import { TableDefinition } from "@/types/table";
import { tableDefinitions } from "@/data/tableDefinitions";

export const getReservationsForDate = (reservations: Reservation[], date: Date) => {
  return reservations.filter(res => 
    res.date.toDateString() === date.toDateString() && 
    (res.status === "pending" || res.status === "confirmed")
  );
};

export const parseReservationFromSupabase = (data: any): Reservation => ({
  id: data.id,
  name: data.name,
  surname: data.surname,
  email: data.email,
  phone: data.phone,
  date: new Date(data.date),
  time: data.time,
  people: data.people,
  notes: data.notes || "",
  status: data.status as ReservationStatus,
  createdAt: new Date(data.created_at || new Date().toISOString()),
  tableId: data.table_id || null,
  tableNumber: data.table_number || null
});

// Formatta i dati della prenotazione per Supabase
export const formatReservationForSupabase = (reservation: Omit<Reservation, "id" | "status" | "createdAt" | "tableId" | "tableNumber">, tableInfo?: { tableId: string; tableNumber: number }) => ({
  name: reservation.name,
  surname: reservation.surname,
  email: reservation.email,
  phone: reservation.phone,
  date: reservation.date.toISOString().split('T')[0],
  time: reservation.time,
  people: reservation.people,
  notes: reservation.notes || '',
  table_id: tableInfo?.tableId || null,
  table_number: tableInfo?.tableNumber || null
});

// Verifica se un tavolo è disponibile per una prenotazione
export const isTableAvailable = (
  tableId: string | number,
  reservations: Reservation[]
): boolean => {
  // Converti tableId a stringa per il confronto
  const tableIdStr = String(tableId);
  
  // Un tavolo è disponibile se non ha prenotazioni pendenti o confermate
  return !reservations.some(res => 
    (res.status === "pending" || res.status === "confirmed") && 
    (res.tableId === tableIdStr || res.tableNumber === Number(tableId))
  );
};

// Verifica se un numero di tavolo è disponibile
export const isTableNumberAvailable = (
  tableNumber: number,
  reservations: Reservation[]
): boolean => {
  // Un tavolo è disponibile se non ha prenotazioni pendenti o confermate
  return !reservations.some(res => 
    (res.status === "pending" || res.status === "confirmed") && 
    res.tableNumber === tableNumber
  );
};

// Trova un tavolo disponibile per una prenotazione in base al numero di persone
export const findAvailableTableForReservation = (
  people: number, 
  tables: TableDefinition[], 
  reservations: Reservation[]
): TableDefinition | null => {
  // Ordina i tavoli per capacità in ordine crescente
  const sortedTables = [...tables]
    .filter(t => !t.isStructure && !t.isWall)
    .sort((a, b) => a.capacity - b.capacity);
  
  // Trova tavoli che possono ospitare il numero di persone
  const suitableTables = sortedTables.filter(table => table.capacity >= people);
  
  if (suitableTables.length === 0) {
    console.log(`Nessun tavolo trovato con capacità maggiore o uguale a ${people}`);
    return null;
  }
  
  // Trova tutti i tavoli adatti disponibili
  const availableTables = suitableTables.filter(table => 
    isTableAvailable(table.id, reservations) && isTableNumberAvailable(table.number, reservations)
  );
  
  if (availableTables.length === 0) {
    console.log(`Nessun tavolo disponibile con capacità sufficiente per ${people} persone`);
    return null;
  }
  
  console.log(`Trovati ${availableTables.length} tavoli disponibili per ${people} persone`);
  
  // Prima prova a trovare una corrispondenza esatta
  const exactCapacityTable = availableTables.find(t => t.capacity === people);
  if (exactCapacityTable) {
    return exactCapacityTable;
  }
  
  // Altrimenti, restituisce il tavolo più piccolo che può ospitare le persone
  return availableTables[0];
};

// Trova tavolo per ID
export const findTableById = (
  tableId: string | null, 
  tables: TableDefinition[]
): TableDefinition | null => {
  if (!tableId) return null;
  
  return tables.find(table => table.id === tableId) || null;
};

// Trova tavolo per numero
export const findTableByNumber = (
  tableNumber: number | null, 
  tables: TableDefinition[]
): TableDefinition | null => {
  if (!tableNumber) return null;
  
  return tables.find(table => table.number === tableNumber) || null;
};

// Ottieni tutti gli ID di tavoli occupati
export const getOccupiedTableIds = (
  reservations: Reservation[]
): Set<string> => {
  const occupiedTableIds = new Set<string>();
  
  reservations.forEach(res => {
    if ((res.status === "pending" || res.status === "confirmed") && res.tableId) {
      occupiedTableIds.add(res.tableId);
    }
  });
  
  return occupiedTableIds;
};

// Ottieni tutti i numeri di tavoli occupati
export const getOccupiedTableNumbers = (
  reservations: Reservation[]
): Set<number> => {
  const occupiedTableNumbers = new Set<number>();
  
  reservations.forEach(res => {
    if ((res.status === "pending" || res.status === "confirmed") && res.tableNumber) {
      occupiedTableNumbers.add(res.tableNumber);
    }
  });
  
  return occupiedTableNumbers;
};

// Ottieni la mappa dello stato dei tavoli (tableId -> stato)
export const getTableStatusMap = (
  reservations: Reservation[]
): Map<string, ReservationStatus> => {
  const tableStatusMap = new Map<string, ReservationStatus>();
  
  reservations.forEach(res => {
    if ((res.status === "pending" || res.status === "confirmed") && res.tableId) {
      tableStatusMap.set(res.tableId, res.status);
    }
  });
  
  return tableStatusMap;
};

// Ottieni la mappa dello stato dei numeri di tavoli (tableNumber -> stato)
export const getTableNumberStatusMap = (
  reservations: Reservation[]
): Map<number, ReservationStatus> => {
  const tableNumberStatusMap = new Map<number, ReservationStatus>();
  
  reservations.forEach(res => {
    if ((res.status === "pending" || res.status === "confirmed") && res.tableNumber) {
      tableNumberStatusMap.set(res.tableNumber, res.status);
    }
  });
  
  return tableNumberStatusMap;
};

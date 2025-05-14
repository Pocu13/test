
import { TableDefinition } from "@/types/table";
import { v4 as uuidv4 } from 'uuid';

// Generiamo UUID validi per tutti i tavoli
export const tableDefinitions: TableDefinition[] = [
  // Tavoli rettangolari
  {
    id: uuidv4(),
    number: 6,
    capacity: 7,
    shape: "rectangle",
    position: { x: 1200, y: 200 },
    width: 180,
    height: 80,
    label: "TAV.6"
  },
  {
    id: uuidv4(),
    number: 11,
    capacity: 9,
    shape: "rectangle",
    position: { x: 600, y: 620 },
    width: 160,
    height: 80,
    rotation: 30,
    label: "TAV.11"
  },
  {
    id: uuidv4(),
    number: 1,
    capacity: 6,
    shape: "rectangle",
    position: { x: 1200, y: 750 },
    width: 180,
    height: 80,
    rotation: -30,
    label: "TAV.1"
  },
  
  // Tavoli rotondi
  {
    id: uuidv4(),
    number: 3,
    capacity: 5,
    shape: "circle",
    position: { x: 1200, y: 500 },
    width: 90,
    height: 90,
    label: "TAV.3"
  },
  {
    id: uuidv4(),
    number: 4,
    capacity: 4,
    shape: "circle",
    position: { x: 1200, y: 350 },
    width: 80,
    height: 80,
    label: "TAV.4"
  },
  {
    id: uuidv4(),
    number: 7,
    capacity: 5,
    shape: "circle",
    position: { x: 1250, y: 80 },
    width: 90,
    height: 90,
    label: "TAV.7"
  },
  {
    id: uuidv4(),
    number: 100,
    capacity: 5,
    shape: "circle",
    position: { x: 450, y: 200 },
    width: 90,
    height: 90,
    label: "TAV.100"
  },
  {
    id: uuidv4(),
    number: 21,
    capacity: 6,
    shape: "circle",
    position: { x: 350, y: 750 },
    width: 150,
    height: 100,
    label: "TAV.21"
  },
  
  // Tavoli quadrati
  {
    id: uuidv4(),
    number: 2,
    capacity: 2,
    shape: "square",
    position: { x: 1250, y: 620 },
    width: 70,
    height: 70,
    label: "TAV.2"
  },
  {
    id: uuidv4(),
    number: 8,
    capacity: 2,
    shape: "square",
    position: { x: 850, y: 80 },
    width: 70,
    height: 70,
    label: "TAV.8"
  },
  {
    id: uuidv4(),
    number: 9,
    capacity: 2,
    shape: "square",
    position: { x: 800, y: 380 },
    width: 70,
    height: 70,
    label: "TAV.9"
  },
  {
    id: uuidv4(),
    number: 10,
    capacity: 2,
    shape: "square",
    position: { x: 800, y: 500 },
    width: 70,
    height: 70,
    label: "TAV.10"
  },
  {
    id: uuidv4(),
    number: 23,
    capacity: 3,
    shape: "square",
    position: { x: 80, y: 750 },
    width: 70,
    height: 70,
    label: "TAV.23"
  },
  {
    id: uuidv4(),
    number: 25,
    capacity: 2,
    shape: "square",
    position: { x: 80, y: 600 },
    width: 70,
    height: 70,
    label: "TAV.25"
  },
  {
    id: uuidv4(),
    number: 27,
    capacity: 2,
    shape: "square",
    position: { x: 80, y: 430 },
    width: 70,
    height: 70,
    label: "TAV.27"
  },
  {
    id: uuidv4(),
    number: 28,
    capacity: 3,
    shape: "square",
    position: { x: 200, y: 200 },
    width: 70,
    height: 70,
    label: "TAV.28"
  },
  {
    id: uuidv4(),
    number: 101,
    capacity: 2,
    shape: "square",
    position: { x: 350, y: 430 },
    width: 70,
    height: 70,
    label: "TAV.101"
  },
  {
    id: uuidv4(),
    number: 102,
    capacity: 2,
    shape: "square",
    position: { x: 650, y: 430 },
    width: 70,
    height: 70,
    label: "TAV.102"
  },
  {
    id: uuidv4(),
    number: 103,
    capacity: 2,
    shape: "square",
    position: { x: 650, y: 300 },
    width: 70,
    height: 70,
    label: "TAV.103"
  },
  
  // Strutture non prenotabili (BAR)
  {
    id: uuidv4(),
    number: 0,
    capacity: 0,
    shape: "rectangle",
    position: { x: 500, y: 520 },
    width: 300,
    height: 60,
    isStructure: true,
    label: "BAR"
  }
];

// Funzione per ottenere un tavolo per numero
export const getTableByNumber = (tableNumber: number): TableDefinition | undefined => {
  return tableDefinitions.find(table => table.number === tableNumber);
};

// Funzione per ottenere un tavolo con capacità sufficiente
export const getTableWithCapacity = (capacity: number): TableDefinition | undefined => {
  // Prima cerca un tavolo con capacità esatta
  const exactTable = tableDefinitions.find(table => !table.isStructure && table.capacity === capacity);
  if (exactTable) return exactTable;
  
  // Se non trovato, cerca il tavolo con capacità minima superiore
  return tableDefinitions
    .filter(table => !table.isStructure && table.capacity > capacity)
    .sort((a, b) => a.capacity - b.capacity)[0];
};

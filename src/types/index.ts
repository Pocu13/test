
export type ReservationStatus = "pending" | "confirmed" | "rejected";

// Well-defined structure for opening days and hours
export interface OpeningDaySchedule {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  enabled: boolean;
  start: string;
  end: string;
}

export interface Reservation {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  people: number;
  notes: string;
  status: ReservationStatus;
  createdAt: Date;
  tableId: string | null;
  tableNumber: number | null;
}

export interface RestaurantSettings {
  openingDays: OpeningDaySchedule[];
  availableSeats: number;
}

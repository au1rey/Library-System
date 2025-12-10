/***********************
 * Reservations.ts - Reservation Model
 * Defines the Reservation interface
 ***********************/
export interface Reservation {
  reservation_id: number;
  user_id: number;
  book_id: number;
  reservation_date: string;
  status: "pending" | "ready" | "fulfilled" | "cancelled";
  position: number;
}

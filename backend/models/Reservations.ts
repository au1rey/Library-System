/***********************
 * Reservations.ts - Reservation Model
 * Defines the Reservation interface
 ***********************/
export interface Reservation {
  id: number;
  userId: number;
  bookId: number;
  reservedAt: string;
}
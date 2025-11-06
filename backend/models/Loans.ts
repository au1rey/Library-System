/***********************
 * Loans.ts - Loans Model
 * Defines the Reservation interface
 ***********************/
export interface Loans {
  id: number;
  userId: number;
  bookCopyId: number;
  loanDate: string;
  returnDate: string | null;
}


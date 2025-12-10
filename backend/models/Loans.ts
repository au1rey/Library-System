/***********************
 * Loans.ts - Loans Model
 * Defines the Reservation interface
 ***********************/
export interface Loans {
  loan_id: number;
  //userId: number;
  copy_id: number;
  loan_date: string;
  return_date: string | null;
}

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
  book_id: number;
  due_date: string;
  status: "active" | "returned";
  book_title: string;
  book_author: string;
  book_cover?: string;
  is_overdue: boolean;
  days_remaining?: number;
}

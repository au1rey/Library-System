/***********************
 * Books.ts - Book Model
 * Defines the Book interface
 * Does not need to be a class - purely for book information
 ***********************/
export interface Book {
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publication_year?: number;
  genre: string;
  description?: string;
  total_copies: number;
  available_copies: number;
  shelf_location?: string;
  pages?: number;
  cover_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

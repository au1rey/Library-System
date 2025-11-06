/***********************
 * Books.ts - Book Model
 * Defines the Book interface
 * Does not need to be a class - purely for book information
 ***********************/
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
}
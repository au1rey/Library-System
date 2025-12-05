// BooksWithCopies.ts
export type BookWithCopies = {
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string | null;
  location: string | null;
  total_copies: number;
  available_copies: number;
  borrowed: number;
  status: string;
  cover_url?: string | null;
  description?: string;
  publisher?: string;
  pages?: number;
  publication_year?: number;
};

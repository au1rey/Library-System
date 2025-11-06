/***********************
 * BookCopy.ts - Book Copy Model
 * Represents a physical copy of a book
 * Includes methods to loan and return the copy
 ***********************/
import db from "../config/database";

export class BookCopy {
  copyId: number;
  bookId: number;
  status: string;

  constructor(copyId: number, bookId: number, status: string) {
    this.copyId = copyId;
    this.bookId = bookId;
    this.status = status;
  }

  static async load(copyId: number) {
    const result = await db.query(
      "SELECT * FROM book_copy WHERE copy_id=$1",
      [copyId]
    );
    const row = result.rows[0];
    return new BookCopy(row.copy_id, row.book_id, row.status);
  }

  async loan(userId: number) {
    if (this.status !== "available") throw new Error("Book not available");
    await db.query(
      "INSERT INTO loans (user_id, book_copy_id, loan_date) VALUES ($1, $2, NOW())",
      [userId, this.copyId]
    );
    await db.query("UPDATE book_copy SET status='loaned' WHERE copy_id=$1", [this.copyId]);
    this.status = "loaned";
  }

  async return() {
    await db.query("UPDATE book_copy SET status='available' WHERE copy_id=$1", [this.copyId]);
    this.status = "available";
  }

  isAvailable() {
    return this.status === "available";
  }
}

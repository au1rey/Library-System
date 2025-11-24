/***********************
 * books.ts - Books Routes
 * Defines routes for managing books
 * Adding and fetching books
 ***********************/
import { Router, Request, Response } from "express";
import { Book } from "../models/Books";
import db from "../config/database";

const router = Router();

// POST /books - Add a new book
// Accepts all book fields from admin form
router.post("/", async (req: Request, res: Response) => {
  const {
    title,
    author,
    isbn,
    publisher,
    publishYear,
    category,
    description,
    copies,
    location,
    pages,
  } = req.body;

  // Validate required fields
  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }
  if (!copies || copies < 1) {
    return res
      .status(400)
      .json({ error: "Number of copies must be at least 1" });
  }
  try {
    // Insert book with all fields
    const result = await db.query(
      `INSERT INTO books 
       (title, author, isbn, publisher, publication_year, genre, description, 
        total_copies, available_copies, shelf_location, pages) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        title,
        author,
        isbn || null,
        publisher || null,
        publishYear ? parseInt(publishYear) : null,
        category || null,
        description || null,
        parseInt(copies),
        parseInt(copies), // available_copies starts same as total_copies
        location || null,
        pages ? parseInt(pages) : null,
      ]
    );

    res.status(201).json({
      message: "Book added successfully",
      book: result.rows[0],
    });
  } catch (err: any) {
    console.error("Error adding book:", err);
    res.status(500).json({ error: err.message });
  }
});
/***********************
 * GET /books - Fetch all books
 ***********************/
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY title");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * GET /books/:id - Fetch single book by ID
 ***********************/
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM books WHERE book_id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;

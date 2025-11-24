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
 * Books and book copies
 *  joined data route
 ***********************/
router.get("/books-with-copies", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        b.book_id,
        b.title,
        b.author,
        b.isbn,
        b.genre,
        b.shelf_location AS location,
        COUNT(bc.copy_id) AS total_copies,
        SUM(CASE WHEN bc.status='available' THEN 1 ELSE 0 END) AS available_copies,
        SUM(CASE WHEN bc.status='loaned' THEN 1 ELSE 0 END) AS borrowed,
        CASE
          WHEN SUM(CASE WHEN bc.status='available' THEN 1 ELSE 0 END) = 0 THEN 'Out of Stock'
          WHEN SUM(CASE WHEN bc.status='available' THEN 1 ELSE 0 END) < 3 THEN 'Low Stock'
          ELSE 'Available'
        END AS status
      FROM books b
      LEFT JOIN book_copy bc ON b.book_id = bc.book_id
      GROUP BY b.book_id
      ORDER BY b.title;
    `);
    console.log("Books with copies:", result.rows);
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
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

/***********************
 * DELETE /books/:id - deletes book and its copies
************************/
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("DELETE route hit", req.params); // <-- add this
    await db.query("DELETE FROM books WHERE book_id = $1", [id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default router;

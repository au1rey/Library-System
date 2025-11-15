/***********************
 * books.ts - Books Routes
 * Defines routes for managing books
 * Adding and fetching books
 ***********************/
import { Router, Request, Response } from "express";
import { Book } from "../models/Books"; // your interface
import db from "../config/database";

const router = Router();

// POST /books - Add a new book
router.post("/", async (req: Request, res: Response) => {
  const { title, author, isbn } = req.body;

  if (!title || !author || !isbn) { // If empty fields
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // DB INSERT
    const result = await db.query(
      "INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3) RETURNING *",
      [title, author, isbn]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /books - Fetch all books
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
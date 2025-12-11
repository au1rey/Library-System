/***********************
 * books.ts - Books Routes
 * Defines routes for managing books
 * Adding, fetching, updating, and deleting books
 ***********************/
import { Router, Request, Response } from "express";
import { Book } from "../models/Books";
import db from "../config/database";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomnumber-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - only accept JPG/PNG
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
// POST /books - Add a new book
// Accepts all book fields from admin form
router.post(
  "/",
  upload.single("coverImage"),
  async (req: Request, res: Response) => {
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
      // Get cover image URL if file was uploaded
      let coverImageUrl: string | null = null;
      if (req.file) {
        // Store relative path (frontend will prepend API_BASE)
        coverImageUrl = `/uploads/${req.file.filename}`;
      }
      // Insert book with all fields
      const result = await db.query(
        `INSERT INTO books 
       (title, author, isbn, publisher, publication_year, genre, description, 
        total_copies, available_copies, shelf_location, pages, cover_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
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
          coverImageUrl,
        ]
      );

      res.status(201).json({
        message: "Book added successfully",
        book: result.rows[0],
      });
    } catch (err: any) {
      console.error("Error adding book:", err);
      // Clean up uploaded file if database insert fails
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      }

      res.status(500).json({ error: err.message });
    }
  }
);

/***********************
 * PUT /books/:id - Update an existing book
 ***********************/
router.put(
  "/:id",
  upload.single("coverImage"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
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

    const publication_year = publishYear;
    const genre = category;
    const total_copies = copies;

    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }
    if (!total_copies || total_copies < 1) {
      return res
        .status(400)
        .json({ error: "Number of copies must be at least 1" });
    }

    try {
      // Start a transaction
      await db.query("BEGIN");

      // Get old cover URL before updating (for optional cleanup)
      const oldBookResult = await db.query(
        `SELECT cover_url FROM books WHERE book_id = $1`,
        [id]
      );
      const oldCoverUrl = oldBookResult.rows[0]?.cover_url;

      // Handle new cover image if uploaded
      let newCoverUrl: string | null = null;
      if (req.file) {
        newCoverUrl = `/uploads/${req.file.filename}`;

        // Delete old cover file from disk
        if (oldCoverUrl) {
          const oldFilePath = path.join(__dirname, "..", oldCoverUrl);
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error("Error deleting old cover:", err);
          });
        }
      }

      // Get current copy count
      const currentCopiesResult = await db.query(
        `SELECT COUNT(*) as count FROM book_copy WHERE book_id = $1`,
        [id]
      );
      const currentCopyCount = parseInt(currentCopiesResult.rows[0].count);
      const newCopyCount = parseInt(total_copies);

      // Update book metadata
      await db.query(
        `UPDATE books 
       SET title = $1, 
           author = $2, 
           isbn = $3, 
           publisher = $4, 
           publication_year = $5, 
           genre = $6, 
           description = $7, 
           total_copies = $8, 
           shelf_location = $9, 
           pages = $10,
           cover_url = COALESCE($11, cover_url)
       WHERE book_id = $12`,
        [
          title,
          author,
          isbn || null,
          publisher || null,
          publication_year ? parseInt(publication_year) : null,
          genre || null,
          description || null,
          newCopyCount,
          location || null,
          pages ? parseInt(pages) : null,
          newCoverUrl,
          id,
        ]
      );

      // Handle copy count changes
      if (newCopyCount > currentCopyCount) {
        // Add new copies
        const copiesToAdd = newCopyCount - currentCopyCount;
        for (let i = 0; i < copiesToAdd; i++) {
          await db.query(
            `INSERT INTO book_copy (book_id, status) VALUES ($1, 'available')`,
            [id]
          );
        }
      } else if (newCopyCount < currentCopyCount) {
        // Remove excess available copies
        const copiesToRemove = currentCopyCount - newCopyCount;

        // Only remove available copies (not loaned ones)
        const availableCopies = await db.query(
          `SELECT copy_id FROM book_copy 
         WHERE book_id = $1 AND status = 'available' 
         ORDER BY copy_id 
         LIMIT $2`,
          [id, copiesToRemove]
        );

        if (availableCopies.rows.length < copiesToRemove) {
          await db.query("ROLLBACK");

          // Clean up newly uploaded file if transaction fails
          if (req.file) {
            fs.unlink(req.file.path, (err) => {
              if (err) console.error("Error deleting uploaded file:", err);
            });
          }

          return res.status(400).json({
            error: `Cannot reduce copies: only ${
              availableCopies.rows.length
            } available copies exist (${
              currentCopyCount - availableCopies.rows.length
            } are currently loaned)`,
          });
        }

        // Delete the available copies
        for (const copy of availableCopies.rows) {
          await db.query(`DELETE FROM book_copy WHERE copy_id = $1`, [
            copy.copy_id,
          ]);
        }
      }

      // Commit the transaction
      await db.query("COMMIT");

      // Fetch the updated book with all computed fields (matching books-with-copies format)
      const result = await db.query(
        `SELECT 
        b.book_id,
        b.title,
        b.author,
        b.isbn,
        b.genre,
        b.shelf_location AS location,
        b.description,
        b.publisher,
        b.pages,
        b.publication_year,
        b.cover_url, 
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
      WHERE b.book_id = $1
      GROUP BY b.book_id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json({
        message: "Book updated successfully",
        book: result.rows[0],
      });
    } catch (err: any) {
      console.error("Error updating book:", err);
      await db.query("ROLLBACK");

      // Clean up uploaded file if error occurs
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      }

      res.status(500).json({ error: err.message });
    }
  }
);

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
        b.description,
        b.publisher,
        b.pages,
        b.publication_year,
        b.cover_url, 
        b.total_copies,
        b.available_copies,
        (b.total_copies - b.available_copies) AS borrowed,
        CASE
          WHEN b.available_copies = 0 THEN 'Out of Stock'
          WHEN b.available_copies < 3 THEN 'Low Stock'
          ELSE 'Available'
        END AS status
      FROM books b
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
    console.log("DELETE route hit", req.params);
    await db.query("DELETE FROM books WHERE book_id = $1", [id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

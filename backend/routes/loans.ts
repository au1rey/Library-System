/***********************
 * loansRoutes.ts - Loan Routes
 * Handles creating, returning, and viewing book loans
 ***********************/
import { Router, Request, Response } from "express";
import db from "../config/database";

const router = Router();

/***********************
 * POST /api/loans
 * Create a new loan (borrow a book copy)
 ***********************/
router.post("/", async (req: Request, res: Response) => {
  const { userId, bookCopyId } = req.body;

  try {
    // Check if the book copy is already loaned out (no return date)
    const existingLoan = await db.query(
      "SELECT * FROM loans WHERE book_copy_id = $1 AND return_date IS NULL",
      [bookCopyId]
    );

    if (existingLoan.rows.length > 0) {
      return res.status(400).json({ error: "Book copy already loaned out" });
    }

    // Create new loan
    const result = await db.query(
      `INSERT INTO loans (user_id, book_copy_id, loan_date, return_date)
       VALUES ($1, $2, NOW(), NULL)
       RETURNING *`,
      [userId, bookCopyId]
    );

    res.status(201).json({
      message: "Loan created successfully",
      loan: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * PUT /api/loans/return/:id
 * Return a loaned book (update returnDate)
 ***********************/
router.put("/return/:id", async (req: Request, res: Response) => {
  const loanId = parseInt(req.params.id);

  try {
    const result = await db.query(
      `UPDATE loans
       SET return_date = NOW()
       WHERE id = $1 AND return_date IS NULL
       RETURNING *`,
      [loanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Loan not found or already returned" });
    }

    res.json({
      message: "Book returned successfully",
      loan: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * GET /api/loans
 * Get all loans
 ***********************/
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM loans ORDER BY loan_date DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * GET /api/loans/user/:userId
 * Get loans for a specific user
 ***********************/
router.get("/user/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  try {
    const result = await db.query(
      "SELECT * FROM loans WHERE user_id = $1 ORDER BY loan_date DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

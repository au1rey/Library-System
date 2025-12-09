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
router.post("/checkout", async (req: Request, res: Response) => {
  const { userId, bookId } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ error: "userId and bookId are required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check available copies
    const bookResult = await client.query(
      "SELECT available_copies, total_copies FROM books WHERE book_id = $1 FOR UPDATE",
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Book not found" });
    }

    const { available_copies } = bookResult.rows[0];

    if (available_copies <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "No copies available for checkout. Please place a reservation.",
      });
    }

    // Create loan with due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const loanResult = await client.query(
      `INSERT INTO loans (user_id, book_id, checkout_date, due_date, status)
       VALUES ($1, $2, NOW(), $3, 'active')
       RETURNING *`,
      [userId, bookId, dueDate]
    );

    // Decrement available copies
    await client.query(
      "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = $1",
      [bookId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Checkout successful",
      loan: loanResult.rows[0],
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/***********************
 * PUT /api/loans/return/:id
 * Return a loaned book (update returnDate)
 ***********************/
router.put("/return/:id", async (req: Request, res: Response) => {
  const loanId = parseInt(req.params.id);

  const client = await db.connect();

  try {
    await client.query("BEGIN");
    // Get loan details
    const loanResult = await client.query(
      "SELECT * FROM loans WHERE id = $1 AND status = 'active' FOR UPDATE",
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Active loan not found" });
    }

    const loan = loanResult.rows[0];

    // Mark loan as returned
    await client.query(
      `UPDATE loans SET return_date = NOW(), status = 'returned' WHERE id = $1`,
      [loanId]
    );

    // Increment available copies
    await client.query(
      "UPDATE books SET available_copies = available_copies + 1 WHERE book_id = $1",
      [loan.book_id]
    );

    // Check if there are pending reservations
    const reservationResult = await client.query(
      `SELECT * FROM reservations 
       WHERE book_id = $1 AND status = 'pending' 
       ORDER BY position, reservation_date 
       LIMIT 1`,
      [loan.book_id]
    );

    let notification = null;
    if (reservationResult.rows.length > 0) {
      // Mark first reservation as ready
      const reservation = reservationResult.rows[0];
      await client.query(
        "UPDATE reservations SET status = 'ready' WHERE id = $1",
        [reservation.id]
      );
      notification = `Reservation for user ${reservation.user_id} is now ready`;
    }
    await client.query("COMMIT");

    res.json({
      message: "Book returned successfully",
      loan: loanResult.rows[0],
      notification,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Return error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/***********************
 * GET /api/loans
 * Get all loans with book and user details
 ***********************/
router.get("/active", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        l.id,
        l.user_id,
        l.book_id,
        l.checkout_date,
        l.due_date,
        l.status,
        b.title as book_title,
        b.author as book_author,
        u.name as user_name,
        u.email as user_email,
        CASE 
          WHEN l.due_date < NOW() THEN true 
          ELSE false 
        END as is_overdue
      FROM loans l
      JOIN books b ON l.book_id = b.book_id
      JOIN users u ON l.user_id = u.user_id
      WHERE l.status = 'active'
      ORDER BY l.due_date ASC`
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Get active loans error:", err);
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
      `SELECT 
        l.*,
        b.title as book_title,
        b.author as book_author,
        b.cover_url as book_cover,
        CASE 
          WHEN l.due_date < NOW() AND l.status = 'active' THEN true 
          ELSE false 
        END as is_overdue,
        CASE 
          WHEN l.status = 'active' THEN EXTRACT(DAY FROM l.due_date - NOW())::int
          ELSE NULL
        END as days_remaining
      FROM loans l
      JOIN books b ON l.book_id = b.book_id
      WHERE l.user_id = $1
      ORDER BY l.checkout_date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Get user loans error:", err);
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * GET /api/loans/stats
 * Get loan statistics for admin dashboard
 ***********************/
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_loans,
        COUNT(*) FILTER (WHERE status = 'active' AND due_date < NOW()) as overdue_loans,
        COUNT(*) FILTER (WHERE status = 'returned') as total_returned
      FROM loans`
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Get loan stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

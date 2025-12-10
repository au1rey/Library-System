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
 *  * Request body: { userId, bookId }
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
    // Find an available copy (or use book_id if you don't track individual copies)
    // If you have a book_copy table, find the first available one:
    const copyResult = await client.query(
      `SELECT copy_id FROM book_copy 
       WHERE book_id = $1 
       AND copy_id NOT IN (
         SELECT copy_id FROM loans WHERE return_date IS NULL
       )
       LIMIT 1`,
      [bookId]
    );

    let copyId;
    if (copyResult.rows.length > 0) {
      copyId = copyResult.rows[0].copy_id;
    } else {
      // Fallback: if no book_copy table, just use book_id as copy_id
      // Or create a synthetic copy_id
      copyId = bookId; // Adjust this based on your schema
    }

    // Create loan with due date (14 days from now)
    const loanResult = await client.query(
      `
      INSERT INTO loans (user_id, copy_id, loan_date, due_date, status)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '14 days', 'active')
      RETURNING *;
      `,
      [userId, copyId]
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
router.put("/return/:loanId", async (req: Request, res: Response) => {
  const loanId = parseInt(req.params.LoanId, 10);

  if (Number.isNaN(loanId)) {
    return res.status(400).json({ error: "Invalid loanId" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Get loan details
    const loanResult = await client.query(
      `SELECT l.*, bc.book_id 
       FROM loans l
       JOIN book_copy bc ON l.copy_id = bc.copy_id
       WHERE l.loan_id = $
        AND l.return_date IS NULL 
       FOR UPDATE`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Active loan not found" });
    }

    const loan = loanResult.rows[0];
    const bookId = loan.book_id as number;

    // Mark loan as returned
    await client.query(
      `UPDATE loans 
      SET return_date = NOW(), status = 'returned' 
      WHERE loan_id= $1`,
      [loanId]
    );

    // Increment available copies
    await client.query(
      "UPDATE books SET available_copies = available_copies + 1 WHERE book_id = $1",
      [bookId]
    );

    // Check if there are pending reservations
    const reservationResult = await client.query(
      `
      SELECT *
       FROM reservations 
       WHERE book_id = $1 
       AND status = 'pending' 
       ORDER BY position ASC, reservation_date ASC
       LIMIT 1
       `,
      [bookId]
    );

    let notification: string | null = null;
    if (reservationResult.rows.length > 0) {
      // Mark first reservation as ready
      const reservation = reservationResult.rows[0];
      await client.query(
        `
        UPDATE reservations
        SET status = 'ready'
        WHERE reservation_id = $1;
        `,
        [reservation.reservation_id]
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
router.get("/active", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  try {
    const result = await db.query(
      `
   SELECT 
        l.loan_id,
        l.copy_id,
        l.loan_date,
        l.due_date,
        l.return_date,
        l.status,
        bc.book_id,
        b.title      AS book_title,
        b.author     AS book_author,
        b.cover_url  AS book_cover,
        CASE 
          WHEN l.due_date < NOW() AND l.return_date IS NULL THEN true 
          ELSE false 
        END AS is_overdue,
        CASE 
          WHEN l.return_date IS NULL THEN EXTRACT(DAY FROM l.due_date - NOW())::int
          ELSE NULL
        END AS days_remaining
      FROM loans l
      JOIN book_copy bc ON l.copy_id = bc.copy_id
      JOIN books b      ON bc.book_id = b.book_id
      WHERE l.user_id = $1
      ORDER BY l.loan_date DESC;
      `,
      [userId]
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
        l.loan_id,
        l.copy_id,
        l.loan_date,
        l.due_date,
        l.return_date,
        l.status,
        bc.book_id,
        b.title as book_title,
        b.author as book_author,
        b.cover_url as book_cover,
        CASE 
          WHEN l.due_date < NOW() AND l.return_date IS NULL THEN true 
          ELSE false 
        END as is_overdue,
        CASE 
          WHEN l.return_date IS NULL THEN EXTRACT(DAY FROM l.due_date - NOW())::int
          ELSE NULL
        END as days_remaining
      FROM loans l
      JOIN book_copy bc ON l.copy_id = bc.copy_id
      WHERE l.user_id = $1
      ORDER BY l.loan_date DESC`,
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

/***********************
 * reservations.ts - Reservation Routes
 * Handles reservation-related API requests
 ***********************/
import { Router, Request, Response } from "express";
import db from "../config/database";

const router = Router();

/***********************
 * Helper: recalc queue positions for a book
 * Orders by reservation_date ASC (FIFO) and keeps only pending/ready
 ***********************/
async function recalcPositionsForBook(client: any, bookId: number) {
  await client.query(
    `
    WITH ordered AS (
      SELECT 
        reservation_id,
        ROW_NUMBER() OVER (
          ORDER BY reservation_date ASC, reservation_id ASC
        ) AS new_position
      FROM reservations
      WHERE book_id = $1
        AND status IN ('pending', 'ready')
    )
    UPDATE reservations r
    SET position = o.new_position
    FROM ordered o
    WHERE r.reservation_id = o.reservation_id;
    `,
    [bookId]
  );
}

/*****************************
 * POST /api/reservations
 * Create a new reservation
 * Body: { userId, bookId }
 *****************************/
router.post("/", async (req: Request, res: Response) => {
  const { userId, bookId } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ error: "userId and bookId are required" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Determine next position in queue for this book
    const posResult = await client.query(
      `
      SELECT COALESCE(MAX(position), 0) + 1 AS next_position
      FROM reservations
      WHERE book_id = $1
        AND status IN ('pending', 'ready');
      `,
      [bookId]
    );

    const nextPosition = posResult.rows[0].next_position as number;

    // Insert reservation
    const insertResult = await client.query(
      `
      INSERT INTO reservations (user_id, book_id, reservation_date, position, status)
      VALUES ($1, $2, NOW(), $3, 'pending')
      RETURNING *;
      `,
      [userId, bookId, nextPosition]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: insertResult.rows[0],
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Create reservation error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/*********************************
 * GET /api/reservations/:userId
 * Get all reservations for a admin
 ***********************************/
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `
      SELECT
        r.reservation_id,
        r.user_id,
        r.book_id,
        r.reservation_date,
        r.position,
        r.status,
        u.full_name  AS user_name,
        u.email AS user_email,
        b.title AS book_title,
        b.author AS book_author,
        b.available_copies
      FROM reservations r
      JOIN library_users u ON r.user_id = u.user_id
      JOIN books b ON r.book_id = b.book_id
      WHERE r.status IN ('pending', 'ready')
      ORDER BY b.title ASC, r.position ASC;
      `
    );

    res.status(200).json(result.rows);
  } catch (err: any) {
    console.error("Get all reservations error:", err);
    res.status(500).json({ error: err.message });
  }
});

/*********************************
 * GET /api/reservations/user/:userId
 * Get all reservations for a user (UserBooks screen)
 *********************************/
router.get("/user/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const result = await db.query(
      `
      SELECT
        r.reservation_id,
        r.user_id,
        r.book_id,
        r.reservation_date,
        r.position,
        r.status,
        b.title       AS book_title,
        b.author      AS book_author,
        b.cover_url   AS book_cover,
        b.available_copies
      FROM reservations r
      JOIN books b ON r.book_id = b.book_id
      WHERE r.user_id = $1
        AND r.status IN ('pending', 'ready', 'fulfilled', 'cancelled')
      ORDER BY r.reservation_date DESC;
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err: any) {
    console.error("Get user reservations error:", err);
    res.status(500).json({ error: err.message });
  }
});

/*********************************
 * POST /api/reservations/:id/cancel
 * Cancel a reservation (keep record, update status + positions)
 *********************************/
router.post("/:id/cancel", async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.id, 10);

  if (Number.isNaN(reservationId)) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const resResult = await client.query(
      `
      SELECT reservation_id, book_id, status
      FROM reservations
      WHERE reservation_id = $1
      FOR UPDATE;
      `,
      [reservationId]
    );

    if (resResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = resResult.rows[0];
    const bookId = reservation.book_id as number;

    // Mark as cancelled
    await client.query(
      `
      UPDATE reservations
      SET status = 'cancelled'
      WHERE reservation_id = $1;
      `,
      [reservationId]
    );

    // Recalculate positions for remaining pending/ready reservations
    await recalcPositionsForBook(client, bookId);

    await client.query("COMMIT");

    res.status(200).json({ message: "Reservation cancelled successfully" });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Cancel reservation error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/*********************************
 * POST /api/reservations/:id/fulfill
 * Fulfill a reservation:
 *  - create a loan
 *  - decrement available copies
 *  - mark reservation as 'fulfilled'
 *  - recalc positions for queue
 *********************************/
router.post("/:id/fulfill", async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.id, 10);

  if (Number.isNaN(reservationId)) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Get reservation + book (lock for update)
    const resResult = await client.query(
      `
      SELECT 
        r.reservation_id,
        r.user_id,
        r.book_id,
        r.status,
        b.available_copies
      FROM reservations r
      JOIN books b ON r.book_id = b.book_id
      WHERE r.reservation_id = $1
      FOR UPDATE;
      `,
      [reservationId]
    );

    if (resResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = resResult.rows[0];
    const bookId = reservation.book_id as number;
    const userId = reservation.user_id as number;
    const availableCopies = reservation.available_copies as number;

    if (!["pending", "ready"].includes(reservation.status)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Only pending or ready reservations can be fulfilled" });
    }

    if (availableCopies <= 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "No available copies to fulfill this reservation" });
    }

    // Find a free copy for this book
    const copyResult = await client.query(
      `
      SELECT bc.copy_id
      FROM book_copy bc
      WHERE bc.book_id = $1
        AND bc.copy_id NOT IN (
          SELECT copy_id
          FROM loans
          WHERE return_date IS NULL
        )
      LIMIT 1;
      `,
      [bookId]
    );

    if (copyResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "No available physical copy to fulfill reservation",
      });
    }

    const copyId = copyResult.rows[0].copy_id as number;

    // Create loan (14-day default)
    const loanResult = await client.query(
      `
      INSERT INTO loans (user_id, copy_id, loan_date, due_date, status)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '14 days', 'active')
      RETURNING *;
      `,
      [userId, copyId]
    );

    // Decrement available copies on books
    await client.query(
      `
      UPDATE books
      SET available_copies = available_copies - 1
      WHERE book_id = $1;
      `,
      [bookId]
    );

    // Mark reservation as fulfilled
    await client.query(
      `
      UPDATE reservations
      SET status = 'fulfilled'
      WHERE reservation_id = $1;
      `,
      [reservationId]
    );

    // Recalc queue positions
    await recalcPositionsForBook(client, bookId);

    await client.query("COMMIT");

    res.status(200).json({
      message: "Reservation fulfilled and loan created successfully",
      loan: loanResult.rows[0],
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Fulfill reservation error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;

/***********************
 * reservations.ts - Reservation Routes
 * Handles reservation-related API requests
 ***********************/
import { Router, Request, Response } from "express";
import db from "../config/database";

const router = Router();

/*****************************
 * POST /api/reservations
 * Create a new reservation
 *****************************/
router.post("/", async (req: Request, res: Response) => {
  const { userId, bookId } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO reservations (user_id, book_id, reserved_at) VALUES ($1, $2, NOW()) RETURNING *",
      [userId, bookId]
    );

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: result.rows[0],
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/*********************************
 * GET /api/reservations/:userId
 * Get all reservations for a user
 ***********************************/
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM reservations WHERE user_id = $1 ORDER BY reserved_at DESC",
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/******************************
 * DELETE /api/reservations/:id
 * Cancel a reservation
 *******************************/
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM reservations WHERE id = $1", [id]);
    res.status(200).json({ message: "Reservation canceled successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

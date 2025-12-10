import { Router, Request, Response } from "express";
import pool from "../config/database";

const router = Router();

/**
 * GET /admin/dashboard-stats
 */
router.get("/dashboard-stats", async (req: Request, res: Response) => {
  try {
    const totalBooks = await pool.query("SELECT COUNT(*) AS count FROM books");
    const totalUsers = await pool.query(
      "SELECT COUNT(*) AS count FROM library_users"
    );
    const activeLoans = await pool.query(
      "SELECT COUNT(*) AS count FROM loans WHERE return_date IS NULL"
    );
    const overdueLoans = await pool.query(
      "SELECT COUNT(*) AS count FROM loans WHERE return_date IS NULL AND due_date < NOW()"
    );
    const activeReservations = await pool.query(
      "SELECT COUNT(*) AS count FROM reservations WHERE status = 'pending'"
    );
    const readyReservations = await pool.query(
      "SELECT COUNT(*) AS count FROM reservations WHERE status = 'ready'"
    );

    res.json({
      totalBooks: Number(totalBooks.rows[0].count),
      totalUsers: Number(totalUsers.rows[0].count),
      active_loans: Number(activeLoans.rows[0].count),
      overdue_loans: Number(overdueLoans.rows[0].count),
      pending_reservations: Number(activeReservations.rows[0].count),
      ready_reservations: Number(readyReservations.rows[0].count),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

/**
 * GET /admin/recent-activity
 */
router.get("/recent-activity", async (req: Request, res: Response) => {
  try {
    const logs = await pool.query(
      `SELECT 
        action, 
        details,
        TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI') AS time
       FROM activity_log
       ORDER BY timestamp DESC
       LIMIT 10`
    );

    res.json(logs.rows);
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

export default router;

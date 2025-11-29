import { Router, Request, Response } from "express";
import pool from "../config/database"; 


const router = Router();

/**
 * GET /admin/dashboard-stats
 */
router.get("/dashboard-stats", async (req: Request, res: Response) => {
  try {
    const totalBooks = await pool.query("SELECT COUNT(*) AS count FROM books");
    const totalUsers = await pool.query("SELECT COUNT(*) AS count FROM users");
    const borrowedBooks = await pool.query("SELECT COUNT(*) AS count FROM borrowings WHERE returned = FALSE");
    const overdueBooks = await pool.query(
      "SELECT COUNT(*) AS count FROM borrowings WHERE returned = FALSE AND due_date < NOW()"
    );

    res.json({
      totalBooks: Number(totalBooks.rows[0].count),
      activeUsers: Number(totalUsers.rows[0].count),
      borrowedBooks: Number(borrowedBooks.rows[0].count),
      overdueBooks: Number(overdueBooks.rows[0].count),
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

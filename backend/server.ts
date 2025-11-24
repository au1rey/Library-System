/***********************
 * Server.ts - Main server file
 * Sets up Express server
 * Includes basic routes and middleware
 ***********************/
// ============================================
// 1. IMPORT DEPENDENCIES
// ============================================
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database"; 
import bookCopyRoutes from "./routes/bookCopies";
import booksRoutes from "./routes/books";
import userRoutes from "./routes/users";
import loanRoutes from "./routes/loans";
import reservationRoutes from "./routes/reservations";


// Load environment variables
dotenv.config();

// ============================================
// 2. CREATE EXPRESS APP
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 3. MIDDLEWARE SETUP
// ============================================
app.use(cors());
app.use(express.json());

// Log every request (for debugging)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ============================================
// 4. TEST ROUTE
// ============================================
app.get("/api/test", (req: Request, res: Response) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// 5. DATABASE CONNECTION TEST
// ============================================
app.get("/api/db-test", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1 + 1 AS result");
    res.json({
      message: "Database connected!",
      result: result.rows[0].result,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// ============================================
// 6. ROUTES
// ============================================
app.use("/api/bookCopies", bookCopyRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/users", userRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reservations", reservationRoutes);

// ============================================
// 7. ERROR HANDLING
// ============================================
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ============================================
// 8. START THE SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test at http://localhost:${PORT}/api/test`);
});

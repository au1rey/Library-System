// ============================================
// 1. IMPORT DEPENDENCIES
// ============================================
const express = require("express"); // Web framework for Node.js
const cors = require("cors"); // Allows frontend to talk to backend
require("dotenv").config(); // Loads variables from .env file

// ============================================
// 2. CREATE EXPRESS APP
// ============================================
const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env, or 3000 as backup

// ============================================
// 3. MIDDLEWARE SETUP
// ============================================
// Middleware = code that runs BEFORE your route handlers

// CORS - allows your React app (port 5173) to make requests to this server (port 3000)
app.use(cors());

// Parse JSON - converts incoming JSON data into JavaScript objects
app.use(express.json());

// Log every request (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Move to the next middleware/route
});

// ============================================
// 4. TEST ROUTE
// ============================================
// This is a simple route to test if your server is working
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// 5. DATABASE CONNECTION TEST
// ============================================
// Import the database connection we created
const db = require("./config/database");

// Test database connection
app.get("/api/db-test", async (req, res) => {
  try {
    // Try to query the database
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({
      message: "Database connected!",
      result: rows[0].result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ============================================
// 6. IMPORT ROUTES (we'll create these later)
// ============================================
// Once we create routes/books.js, we'll uncomment this:
// const bookRoutes = require('./routes/books');
// app.use('/api/books', bookRoutes);

// ============================================
// 7. ERROR HANDLING
// ============================================
// Catch any routes that don't exist
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ============================================
// 8. START THE SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Test it at http://localhost:${PORT}/api/test`);
});

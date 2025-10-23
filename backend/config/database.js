// Import the mysql2 library
const mysql = require("mysql2");

// Import dotenv to read .env file
require("dotenv").config();

// Create a connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Reads DB_HOST from .env
  user: process.env.DB_USER, // Reads DB_USER from .env
  password: process.env.DB_PASSWORD, // Reads DB_PASSWORD from .env
  database: process.env.DB_NAME, // Reads DB_NAME from .env
  port: process.env.DB_PORT, // Reads DB_PORT from .env
  waitForConnections: true, // Wait if all connections are busy
  connectionLimit: 10, // Max 10 connections at once
  queueLimit: 0, // No limit on waiting requests
});

// Convert pool to use Promises instead of callbacks
const promisePool = pool.promise();
// Test the connection (optional but helpful)
promisePool
  .query("SELECT 1")
  .then(() => {
    console.log("✅ Database connection pool created successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });
// Export so other files can use this connection
module.exports = promisePool;

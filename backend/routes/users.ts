/***********************
 * libraryUsers.ts - Library User Routes
 * Handles user registration, login, and retrieval
 ***********************/
import { Router, Request, Response } from "express";
import { LibraryUser } from "../models/LibraryUsers";
import db from "../config/database";

const router = Router();

/***********************
 * Register a new user
 ***********************/
router.post("/register", async (req: Request, res: Response) => {
  const { fullName, email, password, userRole } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.query(
      "SELECT * FROM library_users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user instance and hash password
    const newUser = new LibraryUser(0, fullName, email, password, userRole);
    await newUser.hashPassword();

    // Insert new user into DB
    const result = await db.query(
      `INSERT INTO library_users (full_name, email, password_hash, user_role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, full_name, email, user_role`,
      [newUser.name, newUser.email, newUser.password, "user"]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * Login user
 ***********************/
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM library_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const row = result.rows[0];

    const user = new LibraryUser(
      row.user_id,
      row.full_name,
      row.email,
      row.password_hash,
      row.user_role
    );

    const passwordValid = await user.checkPassword(password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.name,
        email: user.email,
        userRole: user.userRole,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/***********************
 * Get user by ID
 ***********************/
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await LibraryUser.load(parseInt(req.params.id));
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;

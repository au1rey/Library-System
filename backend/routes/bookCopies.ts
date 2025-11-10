/***********************
 * bookCopies.ts - Book Copies Routes
 * Defines routes for managing book copies
 ***********************/
import { BookCopy } from "../models/BookCopy";
import { LibraryUser } from "../models/LibraryUsers";
import { Book } from "../models/Books";
import { Router, Request, Response } from "express";
import pool from "../config/database";

const router = Router(); // mini server that handles routes

// Handles post requests to loan
router.post("/loan", async (req: Request, res: Response) => {
    const { copyId, userId } = req.body;
    try {
        const copy = await BookCopy.load(copyId); // load function from BookCopy model, wait for result
        await copy.loan(userId);
        res.status(200).json({ message: "Book copy loaned successfully" });
    } catch (err: any) { // if copy not loaned
        res.status(400).json({ error: err.message });
    }
});

// Handles post requests to return
router.post("/return", async (req: Request, res: Response) => {
    const { copyId } = req.body;
    try {
        const copy = await BookCopy.load(copyId); // load function from BookCopy model, wait for result
        await copy.return();
        res.status(200).json({ message: "Book copy returned successfully" });
    } catch (err: any) { // if copy not returned
        res.status(400).json({ error: err.message });
    }
});

// Handles get requests to check availability to display on frontend
router.get("/:copyId/availability", async (req: Request, res: Response) => {
  const copyId = parseInt(req.params.copyId);
  try {
    const copy = await BookCopy.load(copyId);
    res.json({ available: copy.isAvailable() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

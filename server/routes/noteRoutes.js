import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  generateNotes,
  getNotes,
  getNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.get("/", protect, getNotes);

router.post("/generate", protect, generateNotes);

router.get("/:noteId", protect, getNote);

router.delete("/:noteId", protect, deleteNote);

export default router;

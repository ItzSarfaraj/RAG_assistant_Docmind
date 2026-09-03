import express from "express";
import {
  createFlashcardSet,
  getFlashcardSets,
  getFlashcardSet,
  getDueCards,
  reviewCard,
} from "../controllers/flashcardController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, createFlashcardSet);
router.get("/", protect, getFlashcardSets);
router.get("/:id", protect, getFlashcardSet);
router.get("/:id/due", protect, getDueCards);
router.post("/:setId/cards/:cardId/review", protect, reviewCard);

export default router;
import Flashcard from "../models/Flashcard.js";
import { generateFlashcards } from "../services/ragService.js";

const createFlashcardSet = async (req, res) => {
  try {
    const { documentIds, title, count } = req.body;
    const { cards } = await generateFlashcards({ documentIds, count: count || 15 });

    const set = await Flashcard.create({
      user: req.user.id,
      sourceDocuments: documentIds,
      title: title || "Flashcard Set",
      cards,
    });

    res.status(201).json({ flashcardSet: set });
  } catch (error) {
    console.error("Flashcard creation error:", error.message);
    res.status(500).json({ message: "Failed to create flashcards." });
  }
};

const getFlashcardSets = async (req, res) => {
  try {
    const sets = await Flashcard.find({ user: req.user.id })
      .select("title cards sourceDocuments createdAt")
      .populate("sourceDocuments", "name")
      .sort({ createdAt: -1 });

    const summarized = sets.map((set) => ({
      _id: set._id,
      title: set.title,
      cardCount: set.cards?.length || 0,
      sourceDocuments: set.sourceDocuments,
      createdAt: set.createdAt,
    }));

    res.status(200).json({ flashcardSets: summarized });
  } catch (error) {
    console.error("Get flashcard sets error:", error.message);
    res.status(500).json({ message: "Failed to load flashcard sets." });
  }
};

const getFlashcardSet = async (req, res) => {
  try {
    const set = await Flashcard.findOne({ _id: req.params.id, user: req.user.id });
    if (!set) return res.status(404).json({ message: "Flashcard set not found." });
    res.status(200).json({ flashcardSet: set });
  } catch (error) {
    console.error("Get flashcard set error:", error.message);
    res.status(500).json({ message: "Failed to load flashcard set." });
  }
};

const getDueCards = async (req, res) => {
  try {
    const set = await Flashcard.findOne({ _id: req.params.id, user: req.user.id });
    if (!set) return res.status(404).json({ message: "Flashcard set not found." });
    const due = set.cards.filter((c) => c.dueDate <= new Date());
    res.status(200).json({ cards: due });
  } catch (error) {
    console.error("Get due cards error:", error.message);
    res.status(500).json({ message: "Failed to load due cards." });
  }
};

// Simple Leitner: correct -> box+1, wrong -> box=1. Interval scales with box.
const BOX_INTERVALS_DAYS = [0, 1, 2, 4, 8, 16]; // index by box number

const reviewCard = async (req, res) => {
  try {
    const { setId, cardId } = req.params;
    const { correct } = req.body;

    const set = await Flashcard.findOne({ _id: setId, user: req.user.id });
    if (!set) return res.status(404).json({ message: "Flashcard set not found." });

    const card = set.cards.id(cardId);
    if (!card) return res.status(404).json({ message: "Card not found." });

    card.box = correct ? Math.min(card.box + 1, 5) : 1;
    const days = BOX_INTERVALS_DAYS[card.box] || 1;
    card.dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await set.save();
    res.status(200).json({ card });
  } catch (error) {
    console.error("Review card error:", error.message);
    res.status(500).json({ message: "Failed to submit review." });
  }
};

export {
  createFlashcardSet,
  getFlashcardSets,
  getFlashcardSet,
  getDueCards,
  reviewCard,
};
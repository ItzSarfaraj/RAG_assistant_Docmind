import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sourceDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  title: { type: String, required: true },
  cards: [{
    question: String,
    answer: String,
    box: { type: Number, default: 1 },        // Leitner box 1-5
    dueDate: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model("Flashcard", flashcardSchema);
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatHistoryRoutes from "./routes/chatHistoryRoutes.js";
import webRoutes from "./routes/webRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import folderRoutes from "./routes/folderRoutes.js"
import flashcardRoutes from "./routes/flashCradRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
dotenv.config();

const app = express();

// ES MODULE PATH SETUP

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database

await connectDB();

// Middleware

app.use(cors());

app.use(express.json());

// Static Uploaded Files

// Makes files inside server/uploads accessible
// through:
// http://localhost:5000/uploads/<filename>

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")),
);

// Routes

app.use("/api/auth", authRoutes);

app.use("/api/documents", documentRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/chat-history", chatHistoryRoutes);

app.use("/api/web", webRoutes);

app.use("/api/notes", noteRoutes);

app.use("/api/folders", folderRoutes);

app.use("/api/flashcards", flashcardRoutes);

app.use("/api/search", searchRoutes);

// Health Check

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DocMind backend is running",
  });
});

// Start Server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
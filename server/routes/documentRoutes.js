import express from "express";

import upload from "../config/multer.js";
import protect from "../middleware/authMiddleware.js";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentControllers.js";

const router = express.Router();

router.post("/upload", protect, upload.single("document"), uploadDocument);

router.get("/", protect, getDocuments);

router.delete("/:id", protect, deleteDocument);

export default router;

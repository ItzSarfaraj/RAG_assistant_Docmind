import express from "express";

import upload from "../config/multer.js";
import protect from "../middleware/authMiddleware.js";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateDocument
} from "../controllers/documentControllers.js";

import { addVideo } from "../controllers/videoController.js";

const router = express.Router();

router.post("/upload", protect, upload.single("document"), uploadDocument);

router.post("/video", protect, addVideo);

router.get("/", protect, getDocuments);

router.delete("/:id", protect, deleteDocument);

router.patch("/:id", protect, updateDocument);

export default router;

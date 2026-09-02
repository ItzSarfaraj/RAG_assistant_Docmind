import express from "express";

import protect from "../middleware/authMiddleware.js";
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
} from "../controllers/folderController.js";

const router = express.Router();

router.get("/", protect, getFolders);
router.post("/", protect, createFolder);
router.patch("/:id", protect, renameFolder);
router.delete("/:id", protect, deleteFolder);

export default router;
import express from "express";

import {
  chatWithDocument,
} from "../controllers/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  chatWithDocument
);

export default router;
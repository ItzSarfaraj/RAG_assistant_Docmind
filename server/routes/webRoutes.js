import express from "express";

import protect from "../middleware/authMiddleware.js";

import { addWebDocument } from "../controllers/webControllers.js";

const router = express.Router();

router.post("/", protect, addWebDocument);

export default router;
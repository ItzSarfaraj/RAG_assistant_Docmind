import express from "express";
import searchController from "../controllers/searchController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, searchController);

export default router;
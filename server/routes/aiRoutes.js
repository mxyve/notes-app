import express from "express";

import { chat, ocr } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/ocr", ocr);

export default router;

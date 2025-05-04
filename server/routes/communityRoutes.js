import express from "express";

import { getPublicNotes } from "../controllers/communityController.js";

const router = express.Router();

router.get("/", getPublicNotes);

export default router;

import express from "express";

import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  getNotesByCategory,
  searchNotes
} from "../controllers/noteController.js";

const router = express.Router();

router.post("/", createNote);
router.get("/user/:userId", getNotes);
router.get("/:id", getNote);
router.get("/categories/:userId/:categoryId", getNotesByCategory);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/search/:userId", searchNotes);

export default router;

import express from "express";
import multer from "multer";

import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  getNotesByCategory,
  searchNotes,
  getTags,
  updateNoteLike,
  updateNoteCollection,
  uploadImage,
} from "../controllers/noteController.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", createNote);
router.get("/user/:userId", getNotes);
router.get("/:id", getNote);
router.get("/categories/:userId/:categoryId", getNotesByCategory);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/search/:userId", searchNotes);
router.get("/tags/:userId", getTags);
router.put("/like/:id", updateNoteLike);
router.put("/collect/:id", updateNoteCollection);
router.post("/upload", upload.single("image"), uploadImage);

export default router;

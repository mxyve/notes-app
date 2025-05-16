import express from "express";

import {
  createComment,
  getComments,
  deleteComment,
  updateCommentLike,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/:noteId", getComments);
router.delete("/:id", deleteComment);
router.put("/like/:id", updateCommentLike);

export default router;

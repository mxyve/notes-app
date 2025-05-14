import express from "express";

import {
  createComment,
  getComments,
  deleteComment,
  updateCommentLike,
  // getReply,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/:noteId", getComments);
router.delete("/:id", deleteComment);
router.put("/like/:id", updateCommentLike);
// router.get("/reply/:noteId/:id", getReply);

export default router;

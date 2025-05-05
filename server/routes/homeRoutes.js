import express from "express";

import {
  getLikeNotes,
  getCollectNotes,
  getMyComments,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/user/like/:userId", getLikeNotes);
router.get("/user/collect/:userId", getCollectNotes);
router.get("/user/comment/:userId", getMyComments);

export default router;

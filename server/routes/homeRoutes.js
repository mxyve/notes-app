import express from "express";

import {
  getLikeNotes,
  getCollectNotes,
  getMyComments,
  getLikeCount,
  getCollectCount,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/user/like/:userId", getLikeNotes);
router.get("/user/collect/:userId", getCollectNotes);
router.get("/user/comment/:userId", getMyComments);
router.get("/user/likeCount/:userId", getLikeCount);
router.get("/user/collectionCount/:userId", getCollectCount);

export default router;

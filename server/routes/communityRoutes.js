import express from "express";

import {
  getPublicNotes,
  getFollows,
  updateFollow,
  getFollowStatus,
  getFollowers,
} from "../controllers/communityController.js";

const router = express.Router();

router.get("/", getPublicNotes);
router.get("/follows/:userId", getFollows);
router.put("/updateFollows/:userId", updateFollow);
router.get("/getFollow/:userId/:followerId", getFollowStatus);
router.get("/userfollowers/:userId", getFollowers);

export default router;

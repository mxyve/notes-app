import express from "express";

import {
  createPicture,
  getPictures,
  getPicture,
  updatePicture,
  deletePicture,
} from "../controllers/pictureController.js";

const router = express.Router();

router.post("/", createPicture);
router.get("/user/:userId", getPictures);
router.get("/:id", getPicture);
router.put("/:id", updatePicture);
router.delete("/:id", deletePicture);

export default router;

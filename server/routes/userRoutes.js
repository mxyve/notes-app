import express from "express";

import {
  registerUser,
  loginUser,
  getUser,
  getUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getUsers);

export default router;

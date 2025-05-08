import express from "express";
import multer from "multer";

import {
  createTodoList,
  getTodoLists,
  getTodoList,
  updateTodoList,
  deleteTodoList,
  getTags,
  uploadImage,
} from "../controllers/todoListController.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", createTodoList);
router.get("/user/:userId", getTodoLists);
router.get("/:id", getTodoList);
router.put("/:id", updateTodoList);
router.delete("/:id", deleteTodoList);
router.get("/tags/:userId", getTags);
router.post("/upload", upload.single("image"), uploadImage);

export default router;

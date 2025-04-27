import express from "express";

import {
  createTodoList,
  getTodoLists,
  getTodoList,
  updateTodoList,
  deleteTodoList,
  getTags,
} from "../controllers/todoListController.js";

const router = express.Router();

router.post("/", createTodoList);
router.get("/user/:userId", getTodoLists);
router.get("/:id", getTodoList);
router.put("/:id", updateTodoList);
router.delete("/:id", deleteTodoList);
router.get("/tags/:userId", getTags);

export default router;

import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/:userId", createCategory);
router.get("/:userId", getCategories);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;

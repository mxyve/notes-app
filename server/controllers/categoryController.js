import pool from "../config/db.js";

// 创建分类
export const createCategory = async (req, res) => {
  try {
    // 从请求体中提取name字段
    const { name } = req.body;
    const { userId } = req.params;
    const { isDelete } = req.query;
    const [result] = await pool.query(
      "INSERT INTO categories (user_id,name,is_delete) VALUES (?,?,?)",
      [userId, name, 0]
    );
    res.status(201).json({ id: result.insertId, userId, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户分类
export const getCategories = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isDelete } = req.query;

    const [rows] = await pool.query(
      `SELECT *
      FROM categories 
      WHERE categories.user_id = ? AND categories.is_delete = ?
      `,
      [userId, 0]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个分类
export const getCategory = async (req, res) => {
  try {
    // 从请求参数中提取id字段
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE id = ? AND is_delete = 0",
      [id]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新分类
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
    res.status(200).json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除分类
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

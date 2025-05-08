import pool from "../config/db.js";

// 创建分类
export const createCategory = async (req, res) => {
  try {
    // 从请求体中提取name字段
    const { name } = req.body;
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // 获取分类列表
// export const getCategories = async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT * FROM categories");
//     res.status(200).json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const getCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDelete } = req.query;

    const [rows] = await pool.query(
      `SELECT * 
      FROM categories c
      LEFT JOIN user_category uc 
        on c.id = uc.category_id 
      WHERE uc.user_id = ? AND uc.is_delete = ?
      `,
      [id, isDelete]
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
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
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

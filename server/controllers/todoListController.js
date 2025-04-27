import pool from "../config/db.js";

// 创建 待办项
export const createTodoList = async (req, res) => {
  try {
    const { userId, title, content, tags } = req.body;
    const [result] = await pool.query(
      "INSERT INTO todolist (user_id, title, content, tags) VALUES (?,?,?,?)",
      [userId, title, content, tags]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      title,
      content,
      tags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户 待办项
export const getTodoLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM todolist WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个 代办项
export const getTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM todolist WHERE id = ?", [
      id,
    ]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "todoList not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新 代办项
export const updateTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    await pool.query(
      "UPDATE todolist SET title = ?, content = ?, tags= ? WHERE id = ?",
      [title, content, JSON.stringify(tags), id]
    );
    res.status(200).json({ id, title, content, tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除笔记
export const deleteTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM todolist WHERE id = ?", [id]);
    res.status(200).json({ message: "todoList deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取标签
export const getTags = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      "SELECT tags FROM todoList WHERE user_id = ?",
      [userId]
    );
    if (rows.length == 0) {
      return res.status(200).json([]);
    }
    const allTags = [].concat(...rows.map((row) => row.tags));
    const uniqueTags = [...new Set(allTags)];
    res.status(200).json(uniqueTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

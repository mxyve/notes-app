import pool from "../config/db.js";

// 创建笔记
export const createNote = async (req, res) => {
  try {
    const { userId, title, content, categoryId, tags } = req.body;
    const [result] = await pool.query(
      "INSERT INTO notes (user_id, title, content, category_id, tags) VALUES (?,?,?,?,?)",
      [userId, title, content, categoryId, JSON.stringify(tags)]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      title,
      content,
      categoryId,
      tags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取笔记列表
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query("SELECT * FROM notes WHERE user_id = ?", [
      userId,
    ]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 根据分类获取笔记列表
export const getNotesByCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? AND category_id = ?",
      [userId, categoryId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个笔记
export const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新笔记
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tags } = req.body;
    await pool.query(
      "UPDATE notes SET title = ?,content = ?,category_id = ?, tags = ? WHERE id = ?",
      [title, content, categoryId, JSON.stringify(tags), id]
    );
    res.status(200).json({ id, title, content, categoryId, tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除笔记
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM notes WHERE id = ?", [id]);
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 模糊查询笔记
export const searchNotes = async (req, res) => {
  try {
    // 从路径参数获取 userId
    const userId = req.params.userId;
    // 从查询参数获取 keyword
    const { keyword } = req.query;
    // 检查 userId 和 keyword 是否存在
    if (!userId || !keyword) {
      return res.status(400).json({ error: "userId and keyword are required" });
    }
    // 查标题和内容
    const [rows] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)",
      [userId, `%${keyword}%`, `%${keyword}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 查询标签
export const getTags = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId:", userId);
    const [rows] = await pool.query(
      "SELECT tags FROM notes WHERE user_id = ?",
      [userId]
    );
    // 检查查询结果是否为空
    if (rows.length === 0) {
      return res.status(200).json([]);
    }
    console.log("rows.length", rows.length);
    // // 合并所有标签数组并去重 先将每一行的 tags 数组提取出来，然后用扩展运算符...把这些数组连接成一个大数组
    const allTags = [].concat(...rows.map((row) => row.tags));
    // 利用 Set 数据结构自动去重的特性（Set 中元素唯一），将合并后的数组转换为 Set 去重，再转换回数组形式，最后将去重后的标签数组返回给客户端
    const uniqueTags = [...new Set(allTags)];
    res.status(200).json(uniqueTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

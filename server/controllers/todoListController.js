import pool from "../config/db.js";
import moment from "moment";

// 创建 待办项
export const createTodoList = async (req, res) => {
  try {
    const { userId, title, content, tags, time } = req.body;
    const [result] = await pool.query(
      "INSERT INTO todolist (user_id, title, content, tags, time) VALUES (?,?,?,?,?)",
      [userId, title, content, tags, time]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      title,
      content,
      tags,
      time,
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

// 获取单个 待办项
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

// 更新 待办项
export const updateTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, time } = req.body;
    // 将前端传来的时间格式转换为数据库期望的格式
    const formattedTime = moment(time).format("YYYY-MM-DD HH:mm:ss");
    await pool.query(
      "UPDATE todolist SET title = ?, content = ?, tags = ? , time = ? WHERE id = ?",
      [title, content, JSON.stringify(tags), formattedTime, id]
    );
    res.status(200).json({ id, title, content, tags, formattedTime });
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
    // 从查询结果中提取所有标签
    const allTags = [].concat(...rows.map((row) => row.tags));
    // 过滤掉空标签
    const filteredTags = allTags.filter((tag) => {
      return tag != null && String(tag).trim() !== "";
    });
    const uniqueTags = [...new Set(filteredTags)];
    res.status(200).json(uniqueTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

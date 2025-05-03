import pool from "../config/db.js";

// 注册用户
export const registerUser = async (req, res) => {
  try {
    // 通过 req.body 获取客户端发送的请求体数据
    const { username, email, password, nickname, avatar_url } = req.body;
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password)VALUES ( ?, ?, ?)",
      [username, email, password]
    );
    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 登录用户
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户信息
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取全部用户信息
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// 更新用户信息
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, nickname, signature, avatarUrl } =
      req.body;

    await pool.query(
      "UPDATE users SET username = ?, email = ?, password = ?, nickname = ?, signature = ?, avatar_url = ? WHERE id = ?",
      [username, email, password, nickname, signature, avatarUrl, id]
    );
    res.status(200).json({
      id,
      username,
      email,
      password,
      nickname,
      signature,
      avatarUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // 更新用户头像 存本地
// export const updateUserAvatar = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "请上传有效的图片文件" });
//     }

//     const userId = req.params.userId;
//     const avatarUrl = `/uploads/avatars/${req.file.filename}`;

//     await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
//       avatarUrl,
//       userId,
//     ]);

//     res.json({
//       message: "头像上传成功",
//       avatar_url: avatarUrl,
//     });
//   } catch (error) {
//     console.error("头像上传错误:", error);
//     res.status(500).json({ error: "头像上传失败" });
//   }
// };

import OSS from "ali-oss";

// 配置OSS客户端
const ossClient = new OSS({
  region: "oss-cn-nanjing", // 例如: 'oss-cn-hangzhou'
  accessKeyId: "LTAI5tQnFUmsUb2gMFdE7W2d",
  accessKeySecret: "McFDTO4w3onWHaSBjKSnFr05IfQShq",
  bucket: "mxy-u",
});

// 更新用户头像
export const updateUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请上传有效的图片文件" });
    }

    const userId = req.params.userId;
    const file = req.file;

    // 生成唯一文件名
    const ext = file.originalname.split(".").pop();
    const filename = `avatars/${userId}_${Date.now()}.${ext}`;

    // 上传到OSS
    const result = await ossClient.put(filename, file.buffer);

    // 获取图片URL（可以设置私有或公开，这里用公开读示例）
    const avatarUrl = result.url;

    // 更新数据库
    await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
      avatarUrl,
      userId,
    ]);

    res.json({
      message: "头像上传成功",
      avatar_url: avatarUrl,
    });
  } catch (error) {
    console.error("头像上传错误:", error);
    res.status(500).json({ error: "头像上传失败" });
  }
};

import pool from "../config/db.js";

// 创建图片
// export const createPicture = async (req, res) => {
//   try {
//     const { userId, title, content } = req.body;
//     const [result] = await pool.query(
//       "INSERT INTO pictures (user_id, title, content) VALUES (?,?,?)",
//       [userId, title, content]
//     );
//     res.status(201).json({ id: result.insertId, userId, title, content });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

import multer from "multer";
// 配置 multer 以处理文件上传
const upload = multer();
export const createPicture = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { userId, title } = req.body;
      let content;

      if (req.file) {
        content = req.file.buffer; // 获取图片的二进制数据
      } else {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const [result] = await pool.query(
        "INSERT INTO pictures (user_id, title, content) VALUES (?,?,?)",
        [userId, title, content]
      );

      res.status(201).json({
        id: result.insertId,
        userId,
        title,
        content: "Image uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

// 获取图片列表
export const getPictures = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM pictures WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个图片
export const getPicture = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT *, TO_BASE64(content) as contentBase64 FROM pictures WHERE id =?",
      [id]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "Picture not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新图片
export const updatePicture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    await pool.query("UPDATE pictures SET title = ?,content = ? WHERE id = ?", [
      title,
      content,
      id,
    ]);
    res.status(200).json({ id, title, content });
  } catch {
    res.status(500).json({ error: error.message });
  }
};

// 删除图片
export const deletePicture = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM pictures WHERE id = ?", [id]);
    res.status(200).json({ message: "Picture deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

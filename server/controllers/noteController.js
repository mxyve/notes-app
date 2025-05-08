import pool from "../config/db.js";

// 创建笔记
export const createNote = async (req, res) => {
  try {
    const {
      userId,
      title,
      content,
      wordCount,
      categoryId,
      tags,
      isPublic,
      isDelete,
    } = req.body;
    const [result] = await pool.query(
      "INSERT INTO notes (user_id, title, content, word_count, category_id, tags, is_public, is_delete) VALUES (?,?,?,?,?,?,?,?)",
      [
        userId,
        title,
        content,
        wordCount,
        categoryId,
        JSON.stringify(tags),
        isPublic,
        isDelete,
      ]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      title,
      content,
      wordCount,
      categoryId,
      tags,
      isPublic,
      isDelete,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取笔记列表 查询语句的拼接
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isDelete, isPublic } = req.query;
    let query = "SELECT * FROM notes WHERE user_id = ?";
    const params = [userId];

    if (isPublic !== undefined) {
      query += " AND is_public = ? ";
      params.push(isPublic);
    }

    if (isDelete !== undefined) {
      query += " AND is_delete = ?";
      params.push(isDelete);
    }

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 根据分类获取笔记列表
export const getNotesByCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    const { isPublic, isDelete } = req.query;

    let query = `
    SELECT n.*, c.name
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE n.user_id =? AND c.id =?
    `;
    const params = [userId, categoryId];

    if (isPublic !== undefined) {
      query += " AND n.is_public =?";
      params.push(isPublic);
    }

    if (isDelete !== undefined) {
      query += " AND n.is_delete =?";
      params.push(isDelete);
    }

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个笔记详情
export const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // 从查询参数获取当前用户 ID
    // 查找在点赞表里面 note_id 是否等于 notes表的 id，user_id 是否等于登录的用户 id，
    // 如果有则返回 is_liked字段，设置为 1，否则，设置为 0。同理收藏功能
    // 获取用户信息：头像，昵称
    const [rows] = await pool.query(
      `SELECT 
        n.*,
        u.username,
        u.nickname,
        u.avatar_url,
        CASE
          WHEN unl.user_id IS NOT NULL THEN 1
          ELSE 0
        END AS is_liked,
        CASE 
          WHEN unc.user_id IS NOT NULL THEN 1
          ELSE 0
        END AS is_collect
      FROM notes n
      LEFT JOIN user_note_likes unl
        on n.id = unl.note_id AND unl.user_id = ?
      LEFT JOIN user_note_collections unc
        ON n.id = unc.note_id AND unc.user_id = ?
      LEFT JOIN users u
        ON n.user_id = u.id  
      WHERE n.id = ?
      `,
      [userId, userId, id]
    );
    // const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
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
    // const { isDelete } = req.query;
    const {
      title,
      content,
      wordCount,
      categoryId,
      tags,
      isPublic,
      isDelete,
      deletedAt,
    } = req.body;

    const validDeletedAt = deletedAt
      ? new Date(deletedAt).toISOString().slice(0, 19).replace("T", " ")
      : null;

    await pool.query(
      "UPDATE notes SET title = ?, content = ?, word_count = ?, category_id = ?, tags = ?, deleted_at = ?, is_public = ?, is_delete = ? WHERE id = ?",
      [
        title,
        content,
        wordCount,
        categoryId,
        JSON.stringify(tags),
        validDeletedAt,
        isPublic,
        isDelete,
        id,
      ]
    );
    res.status(200).json({
      id,
      title,
      content,
      wordCount,
      categoryId,
      tags,
      deletedAt: validDeletedAt,
      isPublic,
      isDelete,
    });
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
    const { keyword, tags } = req.query;
    // 检查 userId 和 keyword 是否存在
    if (!userId || !keyword) {
      return res.status(400).json({ error: "userId and keyword are required" });
    }
    let sql =
      "SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)";
    let values = [userId, `%${keyword}%`, `%${keyword}%`];

    if (tags) {
      // 例如 React,JavaScript,Node.js, 这行代码会将这种字符串形式的 tags 转换为数组 ["React", "JavaScript", "Node.js"]
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      console.log("tagArray:", tagArray);
      const placeholders = tagArray
        .map(() => "JSON_CONTAINS(tags, JSON_ARRAY(?))")
        .join(" AND "); // 前后要加空格 否则JSON_CONTAINS(tags, JSON_ARRAY('React'))ANDJSON_CONTAINS(tags, JSON_ARRAY('markdown'))
      sql += `AND (${placeholders})`;
      tagArray.forEach((tag) => values.push(tag));
    }
    const [rows] = await pool.query(sql, values);
    res.status(200).json(rows);
    // // 查标题和内容
    // const [rows] = await pool.query(
    //   "SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)",
    //   [userId, `%${keyword}%`, `%${keyword}%`]
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

// 点赞笔记
export const updateNoteLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 获取当前笔记的点赞数
    const [rows] = await pool.query(
      "SELECT like_count FROM notes WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    // 点赞数
    let currentLikeCount = rows[0].like_count;

    // 查询用户对该笔记的点赞状态
    const [likeStatusRows] = await pool.query(
      "SELECT * FROM user_note_likes WHERE user_id =? AND note_id=?",
      [userId, id]
    );

    // 切换用户的点赞状态
    let increment;
    let flag;
    if (likeStatusRows.length > 0) {
      // 用户已点赞，执行取消点赞操作（删除记录）
      await pool.query(
        "DELETE FROM user_note_likes WHERE user_id = ? AND note_id = ?",
        [userId, id]
      );
      increment = -1;
      flag = 0;
    } else {
      // 用户未点赞，执行点赞操作（添加记录）
      await pool.query(
        "INSERT INTO user_note_likes (user_id, note_id) VALUES (?, ?)",
        [userId, id]
      );
      increment = 1;
      flag = 1;
    }

    // 计算更新后的点赞数
    currentLikeCount += increment;

    // 更新笔记的点赞数
    await pool.query("UPDATE notes SET like_count = ? Where id = ?", [
      currentLikeCount,
      id,
    ]);

    res.status(200).json({
      message: "note like update",
      like_count: currentLikeCount,
      is_liked: flag,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 收藏笔记
export const updateNoteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 获取当前笔记的收藏数
    const [rows] = await pool.query(
      "SELECT collection_count FROM notes WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    // 收藏数
    let currentCollectionCount = rows[0].collection_count;

    // 查询用户对该笔记的收藏状态
    const [collectStatusRows] = await pool.query(
      "SELECT * FROM user_note_collections WHERE user_id =? AND note_id=?",
      [userId, id]
    );

    // 切换用户的收藏状态
    let increment;
    let flag;
    if (collectStatusRows.length > 0) {
      // 用户已收藏，执行取消收藏操作（删除记录）
      await pool.query(
        "DELETE FROM user_note_collections WHERE user_id = ? AND note_id = ?",
        [userId, id]
      );
      increment = -1;
      flag = 0;
    } else {
      // 用户未收藏执行收藏操作（添加记录）
      await pool.query(
        "INSERT INTO user_note_collections (user_id, note_id) VALUES (?, ?)",
        [userId, id]
      );
      increment = 1;
      flag = 1;
    }

    // 计算更新后的收藏数
    currentCollectionCount += increment;

    // 更新笔记的收藏数
    await pool.query("UPDATE notes SET collection_count = ? Where id = ?", [
      currentCollectionCount,
      id,
    ]);

    res.status(200).json({
      message: "note like update",
      collection_count: currentCollectionCount,
      is_collect: flag,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // 图片上传
// import multer from "multer";
// import path from "path";
// import client from "../config/oss.js"; // 确保已配置OSS客户端
// import { v4 as uuidv4 } from "uuid"; // 使用uuid生成更安全的随机文件名

// // 配置multer
// export const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     // 验证文件类型
//     const allowedMimeTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//     ];
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("仅支持JPEG、PNG、GIF和WebP格式的图片"), false);
//     }
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 限制5MB
//     files: 1, // 限制单次上传1个文件
//   },
// });

// // 图片上传控制器
// export const uploadImg = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         error: "请上传有效的图片文件",
//         details: "未收到文件或文件类型不符合要求",
//       });
//     }

//     // 生成更安全的文件名
//     const fileExt = path.extname(req.file.originalname);
//     const fileName = `images/${uuidv4()}${fileExt}`;

//     // 上传到OSS
//     const result = await client.put(fileName, req.file.buffer, {
//       headers: {
//         "Content-Disposition": "inline",
//         "Cache-Control": "max-age=31536000", // 1年缓存
//       },
//     });

//     // 返回HTTPS URL（如果OSS支持）
//     const httpsUrl = result.url.replace("http://", "https://");

//     res.json({
//       url: httpsUrl,
//       message: "图片上传成功",
//       fileName: fileName,
//       size: req.file.size,
//     });
//   } catch (error) {
//     console.error("上传失败:", error);

//     // 更详细的错误响应
//     const statusCode = error.code === "AccessDeniedError" ? 403 : 500;
//     res.status(statusCode).json({
//       error: "图片上传失败",
//       details: error.message,
//       code: error.code || "UPLOAD_ERROR",
//     });
//   }
// };

import client from "../config/oss.js";
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "未上传文件" });
    }

    const result = await client.put(
      `images/${Date.now()}-${req.file.originalname}`,
      req.file.buffer
    );

    res.status(200).json({ url: result.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

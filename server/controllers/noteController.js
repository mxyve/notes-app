import pool from "../config/db.js";

// 创建笔记
export const createNote = async (req, res) => {
  try {
    const { userId, title, content, wordCount, categoryId, tags, isPublic } =
      req.body;
    const [result] = await pool.query(
      "INSERT INTO notes (user_id, title, content, word_count, category_id, tags,is_public) VALUES (?,?,?,?,?,?,?)",
      [
        userId,
        title,
        content,
        wordCount,
        categoryId,
        JSON.stringify(tags),
        isPublic,
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
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取笔记列表
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isDelete } = req.query;
    let query = "SELECT * FROM notes WHERE user_id = ?";
    const params = [userId];

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
    const { userId } = req.query; // 从查询参数获取当前用户 ID
    // 查找在点赞表里面 note_id 是否等于 notes表的 id，user_id 是否等于登录的用户 id，
    // 如果有则返回 is_liked字段，设置为 1，否则，设置为 0。同理收藏功能
    const [rows] = await pool.query(
      `SELECT 
        n.*,
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
    const { title, content, wordCount, categoryId, tags } = req.body;
    await pool.query(
      "UPDATE notes SET title = ?,content = ?,word_count = ?,category_id = ?, tags = ? WHERE id = ?",
      [title, content, wordCount, categoryId, JSON.stringify(tags), id]
    );
    res.status(200).json({ id, title, content, wordCount, categoryId, tags });
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

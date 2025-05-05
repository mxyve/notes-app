import pool from "../config/db.js";

// 获取用户点赞的笔记列表
export const getLikeNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    // 查找在点赞表里面 note_id 是否等于 notes表的 id，user_id 是否等于登录的用户 id，
    // 如果有则返回 is_liked字段，设置为 1，否则，设置为 0。
    // 返回is_like为1的笔记
    const [rows] = await pool.query(
      `SELECT 
            n.*,
            CASE
              WHEN unl.user_id IS NOT NULL THEN 1
              ELSE 0
            END AS is_liked
          FROM notes n
          LEFT JOIN user_note_likes unl
            on n.id = unl.note_id AND unl.user_id = ?
          WHERE 
            CASE
                WHEN unl.user_id IS NOT NULL THEN 1
                ELSE 0
            END = 1
          `,
      [userId]
    );
    // const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
    if (rows.length > 0) {
      // 返回所有点赞的笔记列表，你应该直接返回 rows 数组，而非 rows[0]。
      res.status(200).json(rows);
    } else {
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户收藏的笔记列表
export const getCollectNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT 
              n.*,
              CASE
                WHEN unc.note_id IS NOT NULL THEN 1
                ELSE 0
              END AS is_collect
            FROM notes n
            LEFT JOIN user_note_collections unc
              on n.id = unc.note_id AND unc.user_id = ?
            WHERE 
              CASE
                  WHEN unc.note_id IS NOT NULL THEN 1
                  ELSE 0
              END = 1
            `,
      [userId]
    );
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取我的评论
export const getMyComments = async (req, res) => {
  try {
    const { userId } = req.params; // 从查询参数获取当前用户 ID
    // 查询评论，并关联 user_comment_likes 表判断是否点赞，如果点赞is_like字段为1；否则，is_like字段为0
    const [rows] = await pool.query(
      `SELECT 
          c.*,
          COALESCE(ucl.is_liked, 0) AS is_liked
        FROM comments c
        LEFT JOIN user_comment_likes ucl 
          ON c.id = ucl.comment_id AND ucl.user_id = ?
        WHERE c.user_id = ?
        ORDER BY c.time DESC
      `,
      [userId, userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

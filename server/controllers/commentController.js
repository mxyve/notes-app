import pool from "../config/db.js";

export const createComment = async (req, res) => {
  try {
    const { userId, noteId, content, time, starCount } = req.body;
    const [result] = await pool.query(
      "INSERT INTO comments (user_id, note_id, content, time, star_count) VALUES (?,?,?,?,?)",
      [userId, noteId, content, time, starCount]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      noteId,
      content,
      time,
      starCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取评论列表
export const getComments = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { userId } = req.query; // 从查询参数获取当前用户 ID
    // 查询评论，并关联 user_comment_likes 表判断是否点赞，如果点赞is_like字段为1；否则，is_like字段为0
    const [rows] = await pool.query(
      `SELECT 
        c.*,
        COALESCE(ucl.is_liked, 0) AS is_liked
      FROM comments c
      LEFT JOIN user_comment_likes ucl 
        ON c.id = ucl.comment_id AND ucl.user_id = ?
      WHERE c.note_id = ?
      ORDER BY c.time DESC
    `,
      [userId, noteId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除评论
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM comments WHERE id = ?", [id]);
    res.status(200).json({ message: "Comments deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新点赞
export const updateCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, noteId } = req.body;

    // 获取当前评论的点赞数
    const [rows] = await pool.query(
      "SELECT star_count FROM comments WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }
    // 点赞数
    const currentStarCount = rows[0].star_count;

    // 查询用户对该评论的点赞状态
    const [likeStatusRows] = await pool.query(
      "SELECT is_liked FROM user_comment_likes WHERE user_id =? AND comment_id =?",
      [userId, id]
    );

    // 更新用户的点赞状态
    let increment;
    if (likeStatusRows.length > 0) {
      const currentLikeStatus = likeStatusRows[0].is_liked;
      currentLikeStatus == 1 ? (increment = -1) : (increment = 1); // 切换状态
    } else {
      increment = 1; // 用户未点赞过，默认 +1
    }

    // 计算更新后的点赞数
    const newStarCount = currentStarCount + increment;

    // 更新评论的点赞数
    await pool.query("UPDATE comments SET star_count = ? WHERE id = ?", [
      newStarCount,
      id,
    ]);

    // 更新用户的点赞状态
    const isLiked = increment === 1;

    // 更新用户的点赞记录
    await pool.query(
      "INSERT INTO user_comment_likes (user_id, comment_id, note_id, is_liked) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE is_liked = ?",
      [userId, id, noteId, isLiked, isLiked]
    );

    res.status(200).json({
      message: "Comment like updated",
      star_count: newStarCount,
      is_liked: isLiked,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

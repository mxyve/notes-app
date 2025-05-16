import pool from "../config/db.js";

// 获取评论列表（包括一级评论和回复）
// 获取评论列表（包括所有层级的评论和回复）
export const getComments = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { userId, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 1. 查询所有层级的评论（扁平化数据）
    const [allComments] = await pool.query(
      `SELECT 
        c.*,
        COALESCE(ucl.is_liked, 0) AS is_liked,
        u.username, u.nickname, u.avatar_url,
        r.username AS reply_username, r.nickname AS reply_nickname
      FROM comments c
      LEFT JOIN (
        SELECT comment_id, 1 AS is_liked 
        FROM user_comment_likes 
        WHERE user_id = ?
      ) ucl ON c.id = ucl.comment_id
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN users r ON r.id = (
        SELECT user_id FROM comments WHERE id = c.reply_id
      )
      WHERE c.note_id = ?
      ORDER BY c.time ASC`, // 按时间升序排列，最新的评论在最后
      [userId, noteId]
    );

    // 2. 查询总评论数（包括所有层级）
    const [totalCount] = await pool.query(
      `SELECT COUNT(*) AS total FROM comments 
       WHERE note_id = ?`,
      [noteId]
    );

    // 3. 构建评论树结构（将扁平化数据转换为树形结构）
    const buildCommentTree = (comments) => {
      // 创建一个以评论ID为键的映射表，方便快速查找
      const commentMap = comments.reduce((map, comment) => {
        map[comment.id] = { ...comment, replies: [] };
        return map;
      }, {});

      // 构建树结构
      const commentTree = [];
      comments.forEach((comment) => {
        const node = commentMap[comment.id];
        if (comment.reply_id === null || comment.reply_id === 0) {
          // 一级评论
          commentTree.push(node);
        } else {
          // 回复评论
          const parentId = comment.reply_id;
          if (commentMap[parentId]) {
            commentMap[parentId].replies.push(node);
          } else {
            // 如果找不到父评论，将其作为一级评论
            commentTree.push(node);
          }
        }
      });

      // 对一级评论进行分页处理
      const paginatedComments = commentTree
        .sort((a, b) => new Date(b.time) - new Date(a.time)) // 按时间降序排列
        .slice(offset, offset + pageSize);

      return paginatedComments;
    };

    // 4. 构建树形结构并应用分页
    const commentsTree = buildCommentTree(allComments);

    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        comments: commentsTree,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: totalCount[0].total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

// 创建评论
export const createComment = async (req, res) => {
  try {
    const { userId, noteId, replyId, content, time, starCount } = req.body;
    const [result] = await pool.query(
      "INSERT INTO comments (user_id, note_id, reply_id, content, time, star_count) VALUES (?,?,?,?,?,?)",
      [userId, noteId, replyId, content, time, starCount]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      noteId,
      replyId,
      content,
      time,
      starCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除评论
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    // 先删除回复该评论的所有回复
    await pool.query("DELETE FROM comments WHERE reply_id =?", [id]);
    // 再删除该评论
    await pool.query("DELETE FROM comments WHERE id =?", [id]);
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

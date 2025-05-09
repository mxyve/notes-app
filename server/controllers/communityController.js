import pool from "../config/db.js";

// 根据is_public获的笔记
export const getPublicNotes = async (req, res) => {
  try {
    // 获取请求中的 page 和 limit 参数，如果未提供则使用默认值
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isPublic = req.query.is_public;
    // 计算偏移量
    const offset = (page - 1) * limit;

    // 构建基础SQL查询
    let sql = `
      SELECT 
        notes.*, 
        users.username, 
        users.nickname, 
        users.avatar_url 
      FROM notes
      JOIN users ON notes.user_id = users.id
    `;
    let countSql = "SELECT COUNT(*) as total FROM notes";

    // 添加WHERE条件
    const whereClauses = [];
    const params = [];

    // 处理is_public 条件
    if (isPublic !== undefined) {
      whereClauses.push("is_public = ?");
      params.push(isPublic);
    }

    // 如果有条件，添加WHERE子句
    if (whereClauses.length > 0) {
      const whereSql = " WHERE " + whereClauses.join(" AND ");
      sql += whereSql;
      countSql += whereSql;
    }

    // 添加分页
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // 执行分页查询
    const [rows] = await pool.query(sql, params);

    // 还可以查询总记录数，用于前端展示分页信息
    const [totalRows] = await pool.query(countSql, params.slice(0, -2)); // 去掉最后两个参数（LIMIT和OFFSET）

    const total = totalRows[0].total;

    // 返回响应，包含当前页数据和总记录数
    res.status(200).json({
      data: rows,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户所有好友（用户关注的人）
export const getFollows = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar_url, u.signature
      FROM follow f
      LEFT JOIN users u
        on u.id = f.follower_id
      WHERE f.user_id = ?
      `,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户所有粉丝（关注用户的人）
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar_url, u.signature
      FROM follow f
      LEFT JOIN users u
        on u.id = f.user_id
      WHERE f.follower_id = ?
      `,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 关注/取关好友
// 一个接口实现添加好友和删除好友功能
export const updateFollow = async (req, res) => {
  try {
    const { userId } = req.params; // 用户id
    const { followerId } = req.body; // 粉丝id

    // 查询用户对该笔记的收藏状态
    const [followStatusRows] = await pool.query(
      "SELECT * FROM follow WHERE user_id = ? AND follower_id = ?",
      [userId, followerId]
    );
    console.log("Received followerId:", followerId);
    let flag;
    if (followStatusRows.length > 0) {
      // 用户已关注，执行取消关注（删除记录）
      await pool.query(
        "DELETE FROM follow WHERE user_id = ? AND follower_id = ?",
        [userId, followerId]
      );
      flag = 0;
    } else {
      // 用户未关注，执行关注操作（添加记录）
      await pool.query(
        "INSERT INTO follow (user_id, follower_id) VALUES (?, ?)",
        [userId, followerId]
      );
      flag = 1;
    }

    res.status(200).json({
      message: "follower update",
      is_flag: flag,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取关注状态
export const getFollowStatus = async (req, res) => {
  try {
    const { userId, followerId } = req.params; // 用户id

    // 查询用户对该笔记的收藏状态
    const [followStatusRows] = await pool.query(
      "SELECT * FROM follow WHERE user_id = ? AND follower_id = ?",
      [userId, followerId]
    );

    let flag;
    if (followStatusRows.length > 0) {
      // 用户已关注
      flag = 1;
    } else {
      // 用户未关注
      flag = 0;
    }
    res.status(200).json({
      message: "follower update",
      is_follow: flag,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

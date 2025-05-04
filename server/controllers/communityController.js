import pool from "../config/db.js";

// 获取公开的笔记
export const getPublicNotes = async (req, res) => {
  try {
    // 获取请求中的 page 和 limit 参数，如果未提供则使用默认值
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isPublic = req.query.is_public;
    // 计算偏移量
    const offset = (page - 1) * limit;

    // 构建基础SQL查询
    let sql = "SELECT * FROM notes";
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

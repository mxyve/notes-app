import pool from "../config/db.js";
import moment from "moment";

// 创建 待办项
export const createTodoList = async (req, res) => {
  try {
    const { userId, title, content, time } = req.body;
    const [result] = await pool.query(
      "INSERT INTO todolist (user_id, title, content, time) VALUES (?,?,?,?)",
      [userId, title, content, time]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      title,
      content,
      time,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户 待办项列表
export const getTodoLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const { tagId, isFinish } = req.query;

    // 构建 SQL 语句和参数数组
    let sql = `SELECT t.*, tt.name AS tag_name, tt.color AS tag_color
               FROM todolist t
               LEFT JOIN todolist_tag tt
                ON t.tag_id = tt.id
               WHERE t.user_id = ?`;
    const values = [userId];

    // 如果 tagId 存在，添加到 SQL 语句和参数数组中
    if (tagId !== undefined) {
      sql += ` AND t.tag_id = ?`;
      values.push(tagId);
    }

    // 如果 isFinish 存在，添加到 SQL 语句和参数数组中
    if (isFinish !== undefined) {
      sql += ` AND t.is_finish = ?`;
      values.push(isFinish);
    }

    const [rows] = await pool.query(sql, values);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个 待办项，返回相应的标签
export const getTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT t.*, tt.name AS tag_name
      FROM todolist t
      LEFT JOIN todolist_tag tt 
      ON t.tag_id = tt.id  
      WHERE t.id = ?
      `,
      [id]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "todoList not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新 待办项
export const updateTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tagId, content, time } = req.body;
    // 将前端传来的时间格式转换为数据库期望的格式
    const formattedTime = moment(time).format("YYYY-MM-DD HH:mm:ss");
    await pool.query(
      "UPDATE todolist SET title = ?, tag_id = ?, content = ?, time = ? WHERE id = ?",
      [title, tagId, content, formattedTime, id]
    );
    res.status(200).json({ id, title, tagId, content, formattedTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除待办项
export const deleteTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM todolist WHERE id = ?", [id]);
    res.status(200).json({ message: "todoList deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // 获取标签
// export const getTags = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const [rows] = await pool.query(
//       "SELECT tags FROM todoList WHERE user_id = ?",
//       [userId]
//     );
//     if (rows.length == 0) {
//       return res.status(200).json([]);
//     }
//     // 从查询结果中提取所有标签
//     const allTags = [].concat(...rows.map((row) => row.tags));
//     // 过滤掉空标签
//     const filteredTags = allTags.filter((tag) => {
//       return tag != null && String(tag).trim() !== "";
//     });
//     const uniqueTags = [...new Set(filteredTags)];
//     res.status(200).json(uniqueTags);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // 创建标签
// export const createTag = async (req, res) => {
//   try {
//     const { tags } = req.body;
//     const [result] = await pool.query(
//       "INSERT INTO todolist (tags) VALUES (?)",
//       [tags]
//     );
//     res.status(201).json({ id: result.insertId, tags });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
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

// // 获取用户全部标签 ["1","2","6"]版本
// export const getTags = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const [rows] = await pool.query(
//       `
//       SELECT tt.*
//       FROM todolist_tag tt
//       WHERE JSON_CONTAINS(tt.user_id, ?)
//       `,
//       [JSON.stringify(userId)]
//     );
//     res.status(200).json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // 删除标签  要看那个标签里面有几个对应的用户，如果只有那一个用户，就要删除那个标签，否则，只要删除 user_id 里面对应的 用户id
// // 既能处理单个用户的标签删除，也能处理多用户共享标签时仅移除特定用户的情况。
// export const deleteTags = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { tagId } = req.query;

//     // 1. 开始事务确保数据一致性
//     await pool.query("START TRANSACTION");

//     // 2. 查询标签当前的用户列表
//     const [tagRows] = await pool.query(
//       "SELECT user_id FROM todolist_tag WHERE id = ?",
//       [tagId]
//     );

//     if (tagRows.length === 0) {
//       await pool.query("ROLLBACK");
//       return res.status(404).json({ error: "标签不存在" });
//     }

//     const tag = tagRows[0];
//     console.log("原始user_id数据:", typeof tag.user_id, tag.user_id);
//     // 原始user_id数据: object [ '1', '2' ]
//     // user_id 已经是一个数组（在 JavaScript 中表现为 object 类型的数组），而不是一个需要通过 JSON.parse 解析的 JSON 字符串。
//     // const userList = JSON.parse(tag.user_id || "[]");
//     const userList = tag.user_id;

//     // 3. 检查用户是否存在于标签中
//     const userIndex = userList.indexOf(userId);
//     if (userIndex === -1) {
//       await pool.query("ROLLBACK");
//       return res.status(400).json({ error: "用户不在此标签中" });
//     }

//     // 4. 根据用户数量决定操作
//     if (userList.length === 1) {
//       // 情况1: 只有一个用户，删除整个标签
//       await pool.query("DELETE FROM todolist_tag WHERE id = ?", [tagId]);
//     } else {
//       // 情况2: 有多个用户，只从user_id中移除当前用户
//       userList.splice(userIndex, 1);
//       await pool.query("UPDATE todolist_tag SET user_id = ? WHERE id = ?", [
//         JSON.stringify(userList),
//         tagId,
//       ]);
//     }

//     // 5. 提交事务
//     await pool.query("COMMIT");
//     res.status(200).json({ message: "操作成功" });
//   } catch (error) {
//     await pool.query("ROLLBACK");
//     res.status(500).json({ error: error.message });
//   }
// };

// 创建标签
// export const createTag = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { name } = req.body;

//     // 检查标签是否已存在
//     const [existingTags] = await pool.query(
//       "SELECT user_id FROM todolist_tag WHERE name =?",
//       [name]
//     );
//     if (existingTags.length > 0) {
//       // let userIds = JSON.parse(existingTags[0].user_id);
//       let userIds = existingTags[0].user_id;
//       //查找标签里面是否有该用户
//       if (!userIds.includes(userId)) {
//         userIds.push(userId);
//         // 更新已存在标签的 user_id 字段
//         await pool.query("UPDATE todolist_tag SET user_id =? WHERE name =?", [
//           JSON.stringify(userIds),
//           name,
//         ]);
//         res
//           .status(200)
//           .json({ message: "UserId added to existing tag successfully" });
//       } else {
//         res.status(200).json({ message: "UserId already exists in this tag" });
//       }
//     } else {
//       // 插入新标签及对应的 userId
//       const [result] = await pool.query(
//         "INSERT INTO todolist_tag (name, user_id) VALUES (?,?)",
//         [name, JSON.stringify([userId])]
//       );
//       res.status(201).json({ id: result.insertId, name });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// 获取用户标签
export const getTags = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `
      SELECT *
      FROM todolist_tag
      WHERE user_id = ?
      `,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除标签
export const deleteTags = async (req, res) => {
  try {
    const { tagId } = req.params;
    await pool.query("DELETE FROM todolist_tag WHERE id = ?", [tagId]);
    res.status(200).json({ message: "操作成功" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 创建标签
export const createTag = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, color } = req.body;

    const [result] = await pool.query(
      "INSERT INTO todolist_tag (user_id,name,color) VALUES (?,?,?) ",
      [userId, name, color]
    );
    res.status(201).json({
      id: result.insertId,
      userId,
      name,
      color,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // 根据用户和标签获取待办项
// export const getTodoListsByTag = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { tagId, isFinish } = req.query;

//     // 构建 SQL 语句和参数数组
//     let sql = `SELECT t.*, tt.name AS tag_name
//                FROM todolist t
//                LEFT JOIN todolist_tag tt
//                 ON t.tag_id = tt.id
//                WHERE t.user_id = ?`;
//     const values = [userId];

//     // 如果 tagId 存在，添加到 SQL 语句和参数数组中
//     if (tagId !== undefined) {
//       sql += ` AND t.tag_id = ?`;
//       values.push(tagId);
//     }

//     // 如果 isFinish 存在，添加到 SQL 语句和参数数组中
//     if (isFinish !== undefined) {
//       sql += ` AND t.is_finish = ?`;
//       values.push(isFinish);
//     }

//     const [rows] = await pool.query(sql, values);
//     res.status(200).json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// 修改标签
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    await pool.query(
      "UPDATE todolist_tag SET name = ?, color = ? WHERE id = ?",
      [name, color, id]
    );
    res.status(200).json({ id, name, color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

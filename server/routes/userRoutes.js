import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  updateUserAvatar,
} from "../controllers/userController.js";

// 创建 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// 确保上传目录存在
const uploadDir = join(__dirname, "../public/uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${uuidv4()}.${ext}`);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只能上传图片文件"), false);
  }
};

// // 创建上传中间件
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 2 * 1024 * 1024, // 限制 2MB
//   },
// });

//------------------------------------------------------------------
// 只需要修改multer配置，不需要本地存储
const upload = multer({
  storage: multer.memoryStorage(), // 使用内存存储而不是磁盘
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("只能上传图片文件"), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 限制2MB
  },
});

// 用户注册
router.post("/register", registerUser);
// 用户登录
router.post("/login", loginUser);
// 获取用户信息
router.get("/:id", getUser);
// 获取全部用户信息
router.get("/", getUsers);
// 更新用户信息
router.put("/update/:id", updateUser);
// 头像上传路由
router.post("/avatar/:userId", upload.single("avatar"), updateUserAvatar);

export default router;

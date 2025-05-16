import express from "express";
// import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import pictureRoutes from "./routes/pictureRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import todoListRoutes from "./routes/todoListRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
// dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173"];
// const allowedOrigins = ["http://124.223.143.202:8081"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "这个网站的跨域资源共享(CORS)策略不允许从指定的来源进行访问。";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.get("/api/test", (req, res) => {
  res.json({ message: "测试成功" });
});
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/pictures", pictureRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/todolist", todoListRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/home", homeRoutes);

// // 后端端口
// app.listen(3011, () => {
//   console.log("Server is running on port 3011");
// });

export default app;

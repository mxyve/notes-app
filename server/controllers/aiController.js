import OpenAI from "openai";
import { readFileSync } from "fs";
import multer from "multer";

const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const openai = new OpenAI({
  apiKey: "sk-778bbd537b5e4cf298c0899dd13e6dda",
  // apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: BASE_URL,
});

// 定义常量 chat 多轮对话
export const chat = async (req, res) => {
  const { systemContent, userMessage } = req.body;
  // 初始化 messages 数组
  const messages = [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];
  try {
    const response = await getResponse(messages);
    const assistant_output = response;
    messages.push({ role: "assistant", content: assistant_output });
    res.json({ message: assistant_output });
  } catch (error) {
    console.error("获取响应时发生错误:", error);
    res.status(500).json({ error: "获取响应时发生错误" });
  }
};

async function getResponse(messages) {
  try {
    const completion = await openai.chat.completions.create({
      // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
      model: "qwen-plus",
      messages: messages,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching response:", error);
    throw error; // 重新抛出异常以便上层处理
  }
}

// 传图识字
// 读取本地文件，并编码为 base 64 格式
const encodeImage = (buffer) => {
  return buffer.toString("base64");
};

// 配置 multer 中间件
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制文件大小为 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件类型"), false);
    }
  },
}).single("image");

export const ocr = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "未提供图片文件" });
      }
      const base64Image = encodeImage(req.file.buffer);
      const completion = await openai.chat.completions.create({
        model: "qwen-vl-ocr",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  // 需要注意，传入BASE64，图像格式（即image/{format}）需要与支持的图片列表中的Content Type保持一致。
                  // PNG图像：  data:image/png;base64,${base64Image}
                  // JPEG图像： data:image/jpeg;base64,${base64Image}
                  // WEBP图像： data:image/webp;base64,${base64Image}
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
                min_pixels: 28 * 28 * 4,
                max_pixels: 28 * 28 * 1280,
              },
              { type: "text", text: "Read all the text in the image." },
            ],
          },
        ],
      });
      res.json({ message: completion.choices[0].message.content });
    } catch (error) {
      console.error("Error in OCR:", error);
      res.status(500).json({ error: "Error in OCR" });
    }
  });
};

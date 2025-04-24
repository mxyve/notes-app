# 使用官方 Node.js 镜像作为基础镜像
FROM node:20

# 设置工作目录
WORKDIR /app

# 复制前端和后端的包管理文件并设置 npm 镜像源
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm config set registry https://registry.npmmirror.com

# 安装前端依赖
WORKDIR /app/client
RUN npm cache clean --force
RUN npm ci --frozen-lockfile
# 调试步骤：输出已安装的依赖列表
RUN npm list unocss || npm install unocss

# 复制前端源代码并构建
COPY client/ .
RUN npm run build

# 安装后端依赖
WORKDIR /app/server
RUN npm install
# 复制后端源代码
COPY server/ .
# 暴露后端服务端口
EXPOSE 3001

# 使用 Nginx 作为静态文件服务器
FROM nginx:alpine

# 将构建后的前端文件复制到 Nginx 的静态文件目录
COPY --from=0 /app/client/build /usr/share/nginx/html

# 暴露前端服务端口
EXPOSE 8081

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
# # 使用官方 Node.js 镜像作为基础镜像
# FROM node:22

# # 设置工作目录
# WORKDIR /app

# # 复制前端和后端的包管理文件并设置 npm 镜像源
# COPY client/package*.json client/
# COPY server/package*.json server/
# RUN npm config set registry https://registry.npmmirror.com

# # CMD ["npm","start","app.js"]

# # 安装前端依赖
# WORKDIR /app/client
# RUN npm cache clean --force
# RUN npm ci --frozen-lockfile

# # 复制前端源代码并构建
# COPY client/ .
# RUN npm run build

# # 安装后端依赖
# WORKDIR /app/server
# RUN npm install
# # 复制后端源代码
# COPY server/ .
# # 暴露后端服务端口
# EXPOSE 3001

# # 使用 Nginx 作为静态文件服务器
# FROM nginx:alpine

# # 将构建后的前端文件复制到 Nginx 的静态文件目录
# COPY --from=0 /app/client/dist /usr/share/nginx/html

# # 暴露前端服务端口
# EXPOSE 8081

# # 启动 Nginx
# CMD ["nginx", "-g", "daemon off;"]

# 构建阶段 1：基于 Node.js 镜像构建前后端项目
FROM node:22 AS build

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

# 复制前端源代码并构建
COPY client/ .
RUN npm run build

# 安装后端依赖
WORKDIR /app/server
RUN npm ci

# 复制后端源代码
COPY server/ .

# 构建阶段 2：基于 Nginx 镜像部署前端项目
FROM nginx:alpine AS nginx-deploy

# 将构建后的前端文件复制到 Nginx 的静态文件目录
COPY --from=build /app/client/dist /usr/share/nginx/html

# 暴露前端服务端口
EXPOSE 8081

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

# 构建阶段 3：基于 Node.js 镜像启动后端项目
FROM node:22 AS server-deploy

# 设置工作目录
WORKDIR /app

# 复制后端构建结果
COPY --from=build /app/server /app/server

# 暴露后端服务端口
EXPOSE 3001

# 启动后端应用，这里假设后端启动脚本是 npm start，根据实际情况修改
# CMD ["npm", "app.js"]
CMD ["node", "server.js"]
# 前端构建阶段
FROM node:20 AS frontend-builder
WORKDIR /app
COPY client/package*.json client/  # 复制前端的 package.json 和 package-lock.json
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci --frozen-lockfile
COPY client/ .  # 复制前端代码
RUN npm run build  # 构建前端项目

# 后端构建阶段
FROM node:20 AS backend-builder
WORKDIR /app
COPY server/package*.json server/  # 复制后端的 package.json 和 package-lock.json
RUN npm config set registry https://registry.npmmirror.com && \
    npm install
COPY server/ .  # 复制后端代码
EXPOSE 3001
CMD ["npm", "start"]  # 启动后端服务

# 生产阶段
FROM nginx:alpine
COPY --from=frontend-builder /app/build /usr/share/nginx/html  # 将前端构建结果复制到 Nginx 的静态文件目录
COPY --from=backend-builder /app/ /app/  # 将后端构建结果复制到容器中
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]  # 启动 Nginx